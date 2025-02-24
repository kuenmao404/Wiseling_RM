using Dapper;
using NLog;
using System.Data;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using WiseLing_API.Lib;
using WiseLing_API.Model;

namespace WiseLing_API.Middleware
{
    // You may need to install the Microsoft.AspNetCore.Http.Abstractions package into your project
    public class LogMiddleware
    {
        private readonly RequestDelegate _next;

        public LogMiddleware(RequestDelegate next)
        {
            _next = next;

        }

        public async Task InvokeAsync(HttpContext context)
        {
            DIModel di = context.RequestServices.GetRequiredService<DIModel>();
            UUIDModel uuidModel = context.RequestServices.GetRequiredService<UUIDModel>();
            LogOpenModel logOpenModel = new LogOpenModel();

            logOpenModel.request.filterActionTime = DateTime.Now;

            di.EnableResponseBodyLogging = false;
            di.EnableRequestBodyLogging = false;
            di.RequestBody = await Param.captureRequestBody(context);

            if (context.Request.HasFormContentType)
            {
                logOpenModel.request.bForm = true;
            }

            await _next(context);

            MyLogger.LoggingRequest(context.Request, di, logOpenModel);
            MyLogger.LoggingResponse(context.Response, di, logOpenModel);
            MyLogger.GetRouteTemplate(context, logOpenModel, uuidModel);

            //若有記一種Log，發送dataprepper
            if (di.EnableRequestLogging || di.EnableResponseLogging)
                Task.Run(() => LoggingDB(logOpenModel));

        }

        private void LoggingDB(LogOpenModel logOpen)
        {
            var logs = new List<LogOpenModel> { logOpen };
            var jsonContent = JsonSerializer.Serialize(logs);
            try
            {
               
                using (var db = new AppDb("Log"))
                {
                    string strSql = "[xp_RequestResponseLog]";
                    var p = new DynamicParameters();
                    p.Add("@sid", logOpen.sid);
                    p.Add("@mid", logOpen.mid);

                    p.Add("@ip", logOpen.request.ip);
                    p.Add("@method", logOpen.request.method);
                    p.Add("@requestURI", logOpen.request.requestURI);
                    p.Add("@path", logOpen.request.path);
                    p.Add("@queryString", logOpen.request.queryString);
                    p.Add("@routeTemplate", logOpen.request.routeTemplate);
                    p.Add("@requestHeader", logOpen.request.requestHeader);
                    p.Add("@bForm", logOpen.request.bForm);
                    p.Add("@requestTime", logOpen.request.requestTime);
                    p.Add("@filterActionTime", logOpen.request.filterActionTime);

                    p.Add("@statusCode", logOpen.response.statusCode);
                    p.Add("@contentType", logOpen.response.contentType);
                    p.Add("@responseTime", logOpen.response.responseTime);

                    p.Add("@sessionDuration", logOpen.sessionDuration);
                    p.Add("@filterActionDuration", logOpen.filterActionDuration);
                    p.Add("@duration", logOpen.duration);

                    db.Connection.Execute(strSql, p, commandType: CommandType.StoredProcedure);
                }

            }
            catch (Exception ex)
            {
                // 錯誤處理
                LogManager.GetLogger("MyLogger").Error($"{jsonContent}\n---\n{ex.Message}\n--------");
            }

            
        }
    }
}
