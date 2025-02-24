using WiseLing_API.Lib;
using WiseLing_API.Model;
using NLog;

namespace WiseLing_API.Middleware
{
    // You may need to install the Microsoft.AspNetCore.Http.Abstractions package into your project
    public class ErrorLogMiddleware
    {
        private readonly RequestDelegate _next;

        public ErrorLogMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext httpContext)
        {
            DIModel di = httpContext.RequestServices.GetRequiredService<DIModel>();
            UUIDModel uuidModel = httpContext.RequestServices.GetRequiredService<UUIDModel>();
            try
            {
                httpContext.Request.EnableBuffering();
                httpContext.Items.Add("bErrorLog", 1);

                await _next(httpContext);
            }
            catch (Exception ex)
            {
                string errMessage = new Fn().Error2txtString(httpContext, ex.Message, di, uuidModel);

                await HandleExceptionAsync(httpContext, ex);
                LogManager.GetLogger("ErrorLog").Error(errMessage);
            }
        }

        private Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = 500;

            ResponseModel res = new ResponseModel
            {
                statusCode = context.Response.StatusCode,
                message = "error"
            };

            return context.Response.WriteAsync(res.ToJson());

        }
    }
}
