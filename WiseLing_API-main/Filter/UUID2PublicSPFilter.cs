using Dapper;
using WiseLing_API.Lib;
using WiseLing_API.Model;
using Microsoft.AspNetCore.Mvc.Filters;

namespace WiseLing_API.Filter
{
    public class UUID2PublicSPFilter : Attribute, IAuthorizationFilter
    {
        private UUIDModel _uuidModel;
        public UUID2PublicSPFilter(UUIDModel uuidModel)
        {
            _uuidModel = uuidModel;
        }
        public void OnAuthorization(AuthorizationFilterContext context)
        {
            HttpContext httpContext = context.HttpContext;

            Guid? uuid = null;
            Param fn_param = new Param();

            if (httpContext.Request.Method == "GET")
            {
                uuid = fn_param.getValueFromRoute<Guid?>(httpContext, "uuid");
            }

            if (uuid == null)
            {
                context.Result = new myUnauthorizedResult("無權限..");
                return;
            }

            string strsql = @$"select spName, param as 'vParam'
                    from vd_PublicUUID2SP
                    where UUID = @uuid";


            using (var db = new AppDb())
            {
                dynamic data = db.Connection.QueryFirstOrDefault<dynamic>(strsql, new { uuid });

                if (data == null || data.param != null)
                {
                    context.Result = new myUnauthorizedResult("無效");
                    return;
                }

                _uuidModel.UUID_data = data;
                _uuidModel.ObjectName =  data.spName;
            }


        }
    }
}
