namespace WiseLing_API.Middleware
{
    public static class HttpContextExtensions
    {
        public static string? GetRouteTemplate(this HttpContext context)
        {
            var endpoint = context.GetEndpoint();
            if (endpoint == null)
                return null;

            // 尋找 ActionDescriptor 並返回路由模板
            var actionDescriptor = endpoint.Metadata
                .OfType<Microsoft.AspNetCore.Mvc.Controllers.ControllerActionDescriptor>()
                .FirstOrDefault();

            return actionDescriptor?.AttributeRouteInfo?.Template;
        }
    }
}
