using Microsoft.IdentityModel.Tokens;
using System.Text.Encodings.Web;
using System.Text.Json;
using WiseLing_API.Middleware;
using WiseLing_API.Model;

namespace WiseLing_API.Lib
{
    public static class MyLogger
    {
        public static void LoggingRequest(HttpRequest request, DIModel di, LogOpenModel logOpenModel)
        {
            if (di.EnableRequestLogging)
            {
                logOpenModel.sid = di.SID;
                logOpenModel.mid = di.MID;
                logOpenModel.request.ip = di.IP;
                logOpenModel.request.method = request.Method;
                logOpenModel.request.requestURI =  $"{request.Scheme}://{request.Host}{request.Path}{request.QueryString}";
                logOpenModel.request.path = request.Path;
                logOpenModel.request.queryString = request.QueryString.ToString();
                logOpenModel.request.requestHeader = FormatHeaders(request.Headers).ToString();
                logOpenModel.request.requestTime = di.RequestTime;
                TimeSpan? difference = logOpenModel.request.filterActionTime - logOpenModel.request.requestTime;
                logOpenModel.sessionDuration = (int)difference?.TotalMilliseconds;
                
                if (di.EnableRequestBodyLogging)
                    logOpenModel.request.requestBody = di.RequestBody;
            }

        }

        public static void LoggingResponse(HttpResponse response, DIModel di, LogOpenModel logOpenModel)
        {
            if (di.EnableResponseLogging)
            {
                logOpenModel.response.statusCode = response.StatusCode;
                logOpenModel.response.contentType = response.ContentType;
                //logOpen.response.responseHeader = FormatHeaders(response.Headers).ToString();
                logOpenModel.response.responseTime = DateTime.Now;
                TimeSpan? difference = logOpenModel.response.responseTime - logOpenModel.request.requestTime;
                logOpenModel.duration = (int)difference?.TotalMilliseconds;
                difference = logOpenModel.response.responseTime - logOpenModel.request.filterActionTime;
                logOpenModel.filterActionDuration = (int)difference?.TotalMilliseconds;
            }

        }

        public static string FormatHeaders(IHeaderDictionary headers)
        {
            var headersDict = headers.ToDictionary(
               header => header.Key,
               header => header.Value.ToString()
           );

            return JsonSerializer.Serialize(headersDict, new JsonSerializerOptions
            {
                Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
                WriteIndented = false // 可選：增加縮排以便更易於閱讀
            });
        }

        public static void GetRouteTemplate(HttpContext context, LogOpenModel logOpenModel, UUIDModel uuidModel)
        {
            string? routeTemplate = context.GetRouteTemplate();

            string[] parts = routeTemplate.Split('/');
            if (parts.Length > 1 && !uuidModel.ObjectName.IsNullOrEmpty())
            {
                switch (parts[1])
                {
                    case "Public":
                        routeTemplate = "Public - " + uuidModel.ObjectName;
                        break;
                    case "Public2":
                        routeTemplate = "Public2 - " + uuidModel.ObjectName;
                        break;
                    case "Tx":
                        routeTemplate = "Tx - " + uuidModel.ObjectName;
                        break;
                    default:
                        break;
                }
            }

            logOpenModel.request.routeTemplate = routeTemplate;
        }

    }
}
