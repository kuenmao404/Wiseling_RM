using WiseLing_API.Lib;
using WiseLing_API.Model;
using Microsoft.AspNetCore.Mvc.Filters;
using Dapper;
using Microsoft.AspNetCore.Mvc;

namespace WiseLing_API.Filter
{
    public class UUID2TxSPAuthFilter : Attribute, IAuthorizationFilter
    {
        private DIModel _di;
        private UUIDModel _uuidModel;
        public UUID2TxSPAuthFilter(DIModel di, UUIDModel uuidModel)
        {
            _di = di;
            _uuidModel = uuidModel;
        }
        public void OnAuthorization(AuthorizationFilterContext context)
        {
            HttpContext httpContext = context.HttpContext;

            int mid = (int)httpContext.Items["MID"];
            if (mid == null || mid <= 0)
            {
                context.Result = new myUnauthorizedResult("無權限.");
                return;
            }

            UUID fn_uuid = new UUID();
            Param fn_param = new Param();

            _uuidModel.RequestBodyJson = fn_param.getBodyParamByJson(httpContext.Request.ContentType, _di);
            if (_uuidModel.RequestBodyJson == null)
            {
                context.Result = new BadRequestObjectResult(new ResponseModel("錯誤傳遞", 400));
                return;
            }

            Guid? uuid = fn_param.getValueFromRoute<Guid?>(httpContext, "uuid");

            if (uuid == null)
            {
                context.Result = new myUnauthorizedResult("無權限..");
                return;
            }

            int? methodType = fn_uuid.getMethodType(httpContext.Request.Method.ToString());

            if(methodType == null)
            {
                context.Result = new myUnauthorizedResult("無權限...");
                return;
            }

            string strsql = @$"select Name, PermissionType, Param, Name2 
                                from vd_UUID2TxSP
                                where UUID = @uuid and MethodType = @methodType";

            using (var db = new AppDb())
            {
                dynamic data = db.Connection.QueryFirstOrDefault(strsql, new { uuid, methodType });

                if (data == null || data?.Name == null)
                {
                    context.Result = new myUnauthorizedResult("無效");
                    return;
                }

                //會員模式
                bool midmode = data.PermissionType == null ? true : false;

                int? cid = fn_param.getParamFromBody<int?>("cid", _uuidModel.RequestBodyJson);

                //必須傳CID，會員模式可不傳CID
                if (cid == null && !midmode)
                {
                    context.Result = new myUnauthorizedResult("無權限");
                    return;
                }

                if (!midmode)
                {
                    myUnauthorizedResult myUnauthorizedResult = fn_uuid.checkCIDPermission(data.PermissionType, mid, cid);
                    if (myUnauthorizedResult != null)
                    {
                        context.Result = myUnauthorizedResult;
                        return;
                    }
                }

                _uuidModel.UUID_data = data;
                _uuidModel.CID = cid;
                _uuidModel.MIDMode = midmode;
                _uuidModel.ObjectName = data.Name2;
            }
        }
    }
}
