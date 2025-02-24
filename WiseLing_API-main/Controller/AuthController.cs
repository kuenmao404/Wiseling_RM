using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.Data;
using System.Web;
using WiseLing_API.Lib;
using WiseLing_API.Model;

namespace WiseLing_API.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;

        // 通過依賴注入獲取 HttpClient
        public AuthController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        /// <summary>
        /// state為導回網站網址
        /// </summary>
        [HttpGet("login")]
        [ApiExplorerSettings(IgnoreApi = true)]
        public IActionResult Login(string? state, string sso)
        {
            int mid = (int)this.HttpContext.Items["MID"];
            if (mid != 0)
            {
                return BadRequest(new ResponseModel("請先登出", 400, false));
            }

            string client_id;
            string baseaddress;
            string redirecturi;
            string weburi = AppConfig.Config["Weburi"];

            string redirectto;
            state = HttpUtility.UrlEncode(state);

            switch (sso)
            {
                case ("wkesso"):
                    client_id = AppConfig.Config["WKESSO:ClientID"];
                    redirecturi = AppConfig.Config["WKESSO:RedirectUri"];
                    baseaddress = AppConfig.Config["WKESSO:BaseAddress"];

                    redirectto = $"{baseaddress}/loginpage?client_id={client_id}&redirecturi={redirecturi}{(state == null ? "" : "&state=" + state)}";

                    return Redirect(redirectto);
                case ("google"):
                    client_id = AppConfig.Config["GoogleSSO:client_id"];
                    redirecturi = AppConfig.Config["GoogleSSO:redirect_uri"];
                    baseaddress = AppConfig.Config["GoogleSSO:auth_uri"];

                    redirectto = $"{baseaddress}?scope=openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email" +
                                 $"&response_type=code&redirect_uri={redirecturi}&client_id={client_id}{(state == null ? "" : "&state=" + state)}";

                    return Redirect(redirectto);
                default:
                    return Ok();
            }
        }

        /// <summary>
        /// callback
        /// </summary>
        [HttpGet("wkesso")]
        [ApiExplorerSettings(IgnoreApi = true)]
        public IActionResult WKESSO(string? state, string grantCode)
        {
            int sid = (int)this.HttpContext.Items["SID"];

            string client_id = AppConfig.Config["WKESSO:ClientID"];
            string redirecturi = AppConfig.Config["WKESSO:RedirectUri"];
            string baseaddress = AppConfig.Config["WKESSO:BaseAddress"];
            string client_secret = AppConfig.Config["WKESSO:ClientSecret"];
            string site = AppConfig.Config["WKESSO:Site"];
            string token_cmd = AppConfig.Config["WKESSO:Token_cmd"];
            string user_cmd = AppConfig.Config["WKESSO:User_cmd"];
            string Weburi = AppConfig.Config["Weburi"];

            Fn fn = new Fn();

            string basic = CommonUtils.Base64Encode($"{client_id}:{client_secret}");

            HttpClient httpClient = _httpClientFactory.CreateClient();

            httpClient.BaseAddress = new Uri(baseaddress);
            httpClient.DefaultRequestHeaders.Add("Authorization", $"Basic {basic}");

            WKESSOModel data = new WKESSOModel
            {
                grantCode = grantCode,
                redirecturi = redirecturi,
                grant_type = "authorization_code"
            };

            WKESSOToken result = fn.Post<WKESSOToken>(httpClient, token_cmd, data, out bool requestApiResult);

            if (requestApiResult)
            {
                httpClient.DefaultRequestHeaders.Clear();

                httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer  {result.access_token}");

                WKESSOMemberInfoModel memberinfo = fn.Get<WKESSOMemberInfoModel>(httpClient, user_cmd, out bool MemberResult1);

                if (MemberResult1)
                {
                    SignInSSO signIn = new SignInSSO
                    {
                        uid = memberinfo.data.mid.ToString(),
                        name = memberinfo.data.nickName,
                        account = memberinfo.data.account,
                        email = memberinfo.data.email,
                        site = site,
                        picture = null,
                        sid = sid
                    };

                    Uri uri = fn.signInSSO(signIn, Weburi, state, sid);
                    return Redirect(uri.AbsoluteUri);
                }
            }

            return Redirect(Weburi);

        }

        /// <summary>
        /// callback
        /// </summary>
        [HttpGet("google")]
        [ApiExplorerSettings(IgnoreApi = true)]
        public IActionResult Google(string? state, string? code)
        {
            if (code.IsNullOrEmpty())
            {
                ResponseModel responseModel = new ResponseModel("授權錯誤", 401, false);
                return Ok(responseModel);
            }

            int sid = (int)this.HttpContext.Items["SID"];

            string token_base = AppConfig.Config["GoogleSSO:token_base"];
            string token_cmd = AppConfig.Config["GoogleSSO:token_cmd"];
            string redirecturi = AppConfig.Config["GoogleSSO:redirect_uri"];
            string client_id = AppConfig.Config["GoogleSSO:client_id"];
            string client_secret = AppConfig.Config["GoogleSSO:client_secret"];
            string site = AppConfig.Config["GoogleSSO:site"];
            string Weburi = AppConfig.Config["Weburi"];

            Fn fn = new Fn();

            GoogleToken data = new GoogleToken
            {
                grant_type = "authorization_code",
                code = code,
                redirect_uri = redirecturi,
                client_id = client_id,
                client_secret = client_secret
            };

            HttpClient httpClient = _httpClientFactory.CreateClient();
            httpClient.BaseAddress = new Uri(token_base);

            dynamic result = fn.Post<dynamic>(httpClient, token_cmd, data, out bool requestApiResult);

            if (requestApiResult)
            {
                string user_base = AppConfig.Config["GoogleSSO:user_base"];
                string user_cmd = AppConfig.Config["GoogleSSO:user_cmd"];
                string url = $"{user_cmd}{result.access_token}";

                HttpClient httpClient_user = _httpClientFactory.CreateClient();
                httpClient_user.BaseAddress = new Uri(user_base);
                httpClient_user.DefaultRequestHeaders.Add("Authorization", $"Bearer  {result.access_token}");

                GoogleUserInfo userInfo = fn.Get<GoogleUserInfo>(httpClient_user, url, out bool userInfoResult);
                if (userInfoResult)
                {
                    SignInSSO signIn = new SignInSSO
                    {
                        uid = userInfo.id,
                        name = userInfo.name,
                        account = userInfo.name,
                        email = userInfo.email,
                        site = site,
                        picture = userInfo.picture,
                        sid = sid
                    };

                    Uri uri = fn.signInSSO(signIn, Weburi, state, sid);
                    return Redirect(uri.AbsoluteUri);
                }

            }

            return Redirect(Weburi);

        }

        /// <summary>
        /// 登出
        /// </summary>
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            int sid = (int)this.HttpContext.Items["SID"];
            int mid = (int)this.HttpContext.Items["MID"];

            string message = "已登出";
            bool status = true;

            if(mid != 0)
            {
                string strSql = "xp_signOut";
                this.HttpContext.Items.Add("ObjectName", strSql);

                using (var db = new AppDb())
                {
                    var p = new DynamicParameters();
                    p.Add("@sid", sid);
                    db.Connection.Execute(strSql, p, commandType: CommandType.StoredProcedure);

                    this.HttpContext.Items.Add("SP_InOut", p);
                }
            }

            return Ok(new { status, message });
        }


    }
}
