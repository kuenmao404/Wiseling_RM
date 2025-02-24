using System.Text.Json;
using System.Text;
using WiseLing_API.Model;
using NLog;
using WiseLing_API.Lib;
using Microsoft.IdentityModel.Tokens;
using System.Net.Http.Headers;

namespace WiseLing_API.Middleware
{
    // You may need to install the Microsoft.AspNetCore.Http.Abstractions package into your project
    public class DataprepperMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IHttpClientFactory _httpClientFactory;

        public DataprepperMiddleware(RequestDelegate next, IHttpClientFactory httpClientFactory)
        {
            _next = next;
            _httpClientFactory = httpClientFactory;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            DIModel di = context.RequestServices.GetRequiredService<DIModel>();
            UUIDModel uuidModel = context.RequestServices.GetRequiredService<UUIDModel>();
            LogOpenModel logOpenModel = new LogOpenModel();
            

            logOpenModel.request.filterActionTime = DateTime.Now;

            di.RequestBody = await Param.captureRequestBody(context);

            var originalBodyStream = context.Response.Body;
            using var memoryStream = new MemoryStream();

            context.Response.Body = memoryStream;

            try
            {
                await _next(context);

                MyLogger.LoggingRequest(context.Request, di, logOpenModel);
                MyLogger.LoggingResponse(context.Response, di, logOpenModel);
                MyLogger.GetRouteTemplate(context, logOpenModel, uuidModel);

                if (di.EnableResponseBodyLogging)
                {
                    logOpenModel.response.responseBody = await CaptureResponseBody(context, memoryStream);
                }

                //若有記一種Log，發送dataprepper
                if (di.EnableRequestLogging || di.EnableResponseLogging)
                    Task.Run(() => SendToDataPrepperAsync(logOpenModel));
            }
            catch
            {
                throw;
            }
            finally
            {
                context.Response.Body.Seek(0, SeekOrigin.Begin);
                await memoryStream.CopyToAsync(originalBodyStream);
                context.Response.Body = originalBodyStream;
            }

            
        }
        
        private async Task<string> CaptureResponseBody(HttpContext httpContext, MemoryStream memoryStream)
        {
            memoryStream.Seek(0, SeekOrigin.Begin);
            if (!httpContext.Response.ContentType.StartsWith("application/json"))
            {
                return "Binary or file content not logged.";
            }

            var responseBody = await new StreamReader(memoryStream, Encoding.UTF8).ReadToEndAsync();

            memoryStream.Seek(0, SeekOrigin.Begin);

            return responseBody;
        }

        private async Task SendToDataPrepperAsync(LogOpenModel logOpen)
        {
            var logs = new List<LogOpenModel> { logOpen };
            var jsonContent = JsonSerializer.Serialize(logs);
            StringContent content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
            var config = AppConfig.Config;
            string dataprepper_uri = config["DataPrepper:Server"].ToString();
            string username = config["DataPrepper:User"].ToString();
            string pd = config["DataPrepper:PD"].ToString();

            try
            {
                var client = _httpClientFactory.CreateClient("MyHttpClient");
                var credentials = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{username}:{pd}"));
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", credentials);


                var response = await client.PostAsync(dataprepper_uri, content);
                if (!response.IsSuccessStatusCode)
                {
                    var responseBody = await response.Content.ReadAsStringAsync();
                    LogManager.GetLogger("DataprepperLogger").Error($"{jsonContent}\n---\n${responseBody}\n--------");
                }
            }
            catch (Exception ex)
            {
                // 錯誤處理
                LogManager.GetLogger("DataprepperLogger").Error($"{jsonContent}\n---\n{ex.Message}\n--------");
            }
        }
    }
}
