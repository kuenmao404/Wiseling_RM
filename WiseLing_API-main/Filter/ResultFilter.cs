using Dapper;
using WiseLing_API.Lib;
using Microsoft.AspNetCore.Mvc.Filters;


namespace WiseLing_API.Filter
{
    public class ResultFilter : Attribute, IResultFilter
    {
        public void OnResultExecuting(ResultExecutingContext context)
        {
            //Result 執行前執行
            

        }
        public void OnResultExecuted(ResultExecutedContext context)
        {
            //Result 執行後執行
            HttpContext httpContext = context.HttpContext;

            string method = httpContext.Request.Method;

            bool bLog = false;
            if (httpContext.Items.ContainsKey("bLog"))
                bLog = (bool)httpContext.Items["bLog"];

            if (httpContext.Items.ContainsKey("SID") && httpContext.Items.ContainsKey("ObjectName")
                 && httpContext.Items.ContainsKey("SP_InOut") && (bLog || method != "GET"))
            {
                int sid = (int)httpContext.Items["SID"];
                string objectName = httpContext.Items["ObjectName"]?.ToString();
                DynamicParameters sp_InOut = (DynamicParameters)httpContext.Items["SP_InOut"];

                using (var db = new AppDb())
                {
                    new UUID().insertLogManTx(method, objectName, sp_InOut, sid, db);
                }
            }

        }
    }
}
