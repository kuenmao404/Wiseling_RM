using Dapper;
using WiseLing_API.Lib;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using System.Data;
using WiseLing_API.Model;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;
using System.Collections.Concurrent;
using Azure;

namespace WiseLing_API.Middleware
{
    // You may need to install the Microsoft.AspNetCore.Http.Abstractions package into your project
    public class MidMiddleware
    {
        private readonly RequestDelegate _next;
        private static readonly ConcurrentDictionary<string, SemaphoreSlim> _locks = new ConcurrentDictionary<string, SemaphoreSlim>();

        public MidMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext httpContext, IHostEnvironment env)
        {
            var config = AppConfig.Config;
            Param fn_param = new Param();
            Fn fn = new Fn();

            DIModel di = httpContext.RequestServices.GetRequiredService<DIModel>();
            di.RequestTime = DateTime.Now;

            int expires = fn_param.ConvertType<int>(config["OAuthToken:Expires"]);
            int expires_Refresh = fn_param.ConvertType<int>(config["OAuthToken:Expires_Refresh"]);
            bool clearWhenClose = fn_param.ConvertType<bool>(config["OAuthToken:ClearWhenClose"]);
            int buffer = fn_param.ConvertType<int>(config["OAuthToken:Buffer"]);

            httpContext.Request.Headers.TryGetValue("User-Agent", out var userAgent);

            string ua = "" + userAgent;

            string ip = httpContext.Connection.RemoteIpAddress.MapToIPv4().ToString();
            if (httpContext.Request.Headers.ContainsKey("X-Forwarded-For"))
                ip = httpContext.Request.Headers["X-Forwarded-For"];

            di.IP = ip;

            string Access_str = "WiseLing_AccessToken";
            string Refresh_str = "WiseLing_RefreshToken";

            string remoteIpAddress = httpContext.Connection.LocalPort.ToString();

            // GET不紀錄ResponseLog
            di.EnableResponseBodyLogging =  httpContext.Request.Method == "GET" ? false : true; ;

            //若IIS與開發站在同一台電腦，名稱加上ip與port，避免Cookie會衝突
            if (env.IsDevelopment())
            {
                Access_str += remoteIpAddress;
                Refresh_str += remoteIpAddress;
            }

#if DEBUG
            Access_str = "WiseLing_AccessToken" + remoteIpAddress;
            Refresh_str = "WiseLing_RefreshToken" + remoteIpAddress;
#endif

            string t_accesstoken = httpContext.Request.Cookies[Access_str];
            string t_refreshtoken = httpContext.Request.Cookies[Refresh_str];


            t_accesstoken = t_accesstoken.IsNullOrEmpty() ? null : CommonUtils.Base64Decrypt(t_accesstoken);
            t_refreshtoken = t_refreshtoken.IsNullOrEmpty() ? null : CommonUtils.Base64Decrypt(t_refreshtoken);

            Guid? access_cookie = fn_param.ConvertType<Guid?>(t_accesstoken);
            Guid? refresh_cookie = fn_param.ConvertType<Guid?>(t_refreshtoken);

            bool isRenew = false;
            bool isNew = refresh_cookie == null;

            // 預設lock名稱
            string keyName = refresh_cookie + "";

            using (var db = new AppDb())
            {
                SemaphoreSlim keyLock = null;

                // 如果不是新訪客，檢查需不需要換證
                if (!isNew)
                {
                    string strsql = @$" select dbo.fn_getRefreshSID(@access_cookie, @refresh_cookie) 'sid'";

                    int? o_sid = db.Connection.QueryFirstOrDefault(strsql, new { access_cookie, refresh_cookie })?.sid;

                    if (o_sid != null)
                    {
                        //有效但不多，微不足道的簡化key
                        keyName = $"ms_{o_sid}";
                        isRenew = true;
                    }
                }

                // 需換證，針對相同refresh token鎖，通一時間只允許一個執行序
                if (isRenew)
                {
                    keyLock = _locks.GetOrAdd(keyName, new SemaphoreSlim(1));

                    // 最多等1秒
                    keyLock.Wait(1000);
                }

                bool success = false;

                try
                {
                    string strSql = "xp_checkSessionToken";
                    var p = new DynamicParameters();
                    p.Add("@ip", ip);
                    p.Add("@uaString", ua);
                    p.Add("@access_cookie", access_cookie);
                    p.Add("@refresh_cookie", refresh_cookie);
                    p.Add("@expires", expires);
                    p.Add("@expires_refresh", expires_Refresh);
                    p.Add("@buffer", buffer);
                    p.Add("@access_new", dbType: DbType.Guid, direction: ParameterDirection.Output);
                    p.Add("@refresh_new", dbType: DbType.Guid, direction: ParameterDirection.Output);
                    p.Add("@expiredDT", dbType: DbType.DateTime, direction: ParameterDirection.Output);
                    p.Add("@expiredDT_Refresh", dbType: DbType.DateTime, direction: ParameterDirection.Output);
                    p.Add("@mid", dbType: DbType.Int32, direction: ParameterDirection.Output);
                    p.Add("@sid", dbType: DbType.Int32, direction: ParameterDirection.Output);
                    p.Add("@bSetCookie", dbType: DbType.Boolean, direction: ParameterDirection.Output);
                    db.Connection.Execute(strSql, p, commandType: CommandType.StoredProcedure);
                    Guid? access_new = p.Get<Guid?>("@access_new");
                    Guid? refresh_new = p.Get<Guid?>("@refresh_new");
                    DateTime expiredDT = p.Get<DateTime>("@expiredDT");
                    DateTime expiredDT_Refresh = p.Get<DateTime>("@expiredDT_Refresh");
                    bool bSetCookie = p.Get<bool>("@bSetCookie");
                    int? mid = p.Get<int?>("@mid");
                    int? sid = p.Get<int?>("@sid");

                    if (sid != null && mid != null)
                    {
                        success = true;

                        di.MID = mid;
                        di.SID = sid;
                        httpContext.Items.Add("MID", mid);
                        httpContext.Items.Add("expiredDT", expiredDT);
                        httpContext.Items.Add("expiredDT_Refresh", expiredDT_Refresh);
                        httpContext.Items.Add("SID", sid);

                        bool bDev = env.IsDevelopment();

#if DEBUG
                        bDev = true;
#endif

                        if (bSetCookie)
                        {
                            cookieModel cookieModel = new cookieModel(clearWhenClose, expiredDT, expiredDT_Refresh, bDev);

                            httpContext.Response.Cookies.Append(Access_str, CommonUtils.Base64Encode(access_new.ToString()), cookieModel.Options);
                            httpContext.Response.Cookies.Append(Refresh_str, CommonUtils.Base64Encode(refresh_new.ToString()), cookieModel.Options_Refresh);
                        }
                    }
                }
                finally
                {
                    if (isRenew)
                    {
                        keyLock.Release();
                    }
                }

                if (!success)
                {
                    httpContext.Response.ContentType = "application/json";
                    httpContext.Response.StatusCode = StatusCodes.Status401Unauthorized;

                    ResponseModel responseModel = new ResponseModel("授權錯誤", 401, false);

                    await httpContext.Response.WriteAsync(JsonConvert.SerializeObject(responseModel));
                }
            }
            await _next(httpContext);
        }
    }
}
