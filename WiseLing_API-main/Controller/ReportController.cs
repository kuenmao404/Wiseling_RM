using Azure;
using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Data;
using WiseLing_API.Filter;
using WiseLing_API.Lib;
using WiseLing_API.Model;

namespace WiseLing_API.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        /// <summary>
        /// 回報影片或題目，若沒傳oid則是頁面回報
        /// --- 回傳 status bit, message string
        /// </summary>
        [HttpPost("")]
        public IActionResult InviteCourse([FromBody] ReportModel body)
        {
            int mid = (int)this.HttpContext.Items["MID"];
            int sid = (int)this.HttpContext.Items["SID"];

            ResponseOKModel responseOK = new ResponseOKModel();

            string title, objectTitle, content;
            int type;

            string strSql = "xp_insReport";
            this.HttpContext.Items.Add("ObjectName", strSql);

            using (var db = new AppDb())
            {
                var p = new DynamicParameters();
                p.Add("@oid", body.oid);
                p.Add("@title", body.title);
                p.Add("@des", body.des);
                p.Add("@path", body.path);
                p.Add("@mid", mid);
                p.Add("@sid", sid);
                p.Add("@status", dbType: DbType.Boolean, direction: ParameterDirection.Output);
                p.Add("@message", dbType: DbType.String, direction: ParameterDirection.Output, size: 255);
                p.Add("@mailTitle", dbType: DbType.String, direction: ParameterDirection.Output, size: 255);
                p.Add("@mailContent", dbType: DbType.String, direction: ParameterDirection.Output, size: -1);
                db.Connection.Execute(strSql, p, commandType: CommandType.StoredProcedure);
                responseOK.status = p.Get<bool>("@status");
                responseOK.message = p.Get<string>("@message");
                title = p.Get<string>("@mailTitle");
                content = p.Get<string>("@mailContent");

                
                this.HttpContext.Items.Add("SP_InOut", p);
            }

            if (responseOK.status)
            {
                var config = AppConfig.Config;

                string email = config["EMail:SenderEMail"];

                new Mail().sendEMail(title, content, email);    
            }

            return Ok(responseOK);
        }
    }
}
