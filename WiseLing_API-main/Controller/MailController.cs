using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using WiseLing_API.Filter;
using WiseLing_API.Lib;
using WiseLing_API.Model;

namespace WiseLing_API.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class MailController : ControllerBase
    {


        /// <summary>
        /// cid為courseCID
        /// 群組邀請信總欄，status信件狀態；searchstr搜尋；信件寄送時區間 (兩個或單一皆可)；以上皆可null
        /// </summary>
        [AuthFilter("M")]
        [HttpGet("")]
        public IActionResult GetCourseInvite(int cid, int? status, string? searchstr, DateTime? startDate, DateTime? endDate, int start = 1, int counts = 10)
        {
            int mid = (int)this.HttpContext.Items["MID"];

            string fetch = @"offset @start - 1 row fetch next @counts rows only";
            string wheresql = @"";
            if (status != null)
                wheresql += @" and status = @status";

            if (!searchstr.IsNullOrEmpty())
                wheresql += @" and site + link + gname + ename + email + isnull(activeName, '') + isnull(namepath, '') like '%' + @searchstr + '%'";

            string startDate_str = "", endDate_str = "";
            if (startDate != null)
            {
                wheresql += @" and since >= @startDate_str";
                startDate_str = startDate?.ToString("yyyy-MM-dd");
            }


            if (endDate != null)
            {
                wheresql += @" and since <= @endDate_str";
                endDate_str = endDate?.ToString("yyyy-MM-dd");
                //yyyy-MM-dd HH:mm:ss.fff
            }

            string strsql = @$"select [iid], [cid], [courseName], 
                                        [gid], [gname], [inviteMID], [inviteName],  [email], [since], [expiredDT], 
                                        [activeMID], [activeName], [activeDate], [groupCID], [state]
                            from vd_InviteHistory
                            where cid = @cid and bDel = 0 {wheresql}
                            order by since desc
                            {fetch}";

            string totalsql = @$"select count(*) 'total' from vd_InviteHistory where cid = @cid and bDel = 0 {wheresql}";

            using (var db = new AppDb())
            {
                var data = db.Connection.Query(strsql, new { cid, start, counts, status, searchstr, startDate_str, endDate_str });
                var total = db.Connection.QueryFirstOrDefault(totalsql, new { cid, status, searchstr, startDate_str, endDate_str });

                return Ok(new { total.total, data });
            }
        }

        /// <summary>
        /// 邀請進入課程
        /// cid為groupCID
        /// --- 回傳 status bit, message string
        /// </summary>
        [AuthFilter("I")]
        [HttpPost("")]
        public IActionResult InviteCourse([FromBody] IviteCourseModel body)
        {
            int mid = (int)this.HttpContext.Items["MID"];
            int sid = (int)this.HttpContext.Items["SID"];

            ResponseOKModel responseOK = new ResponseOKModel();

            responseOK = new Mail().sendCourseEMail(body, mid, sid);

            return Ok(responseOK);
        }

        /// <summary>
        /// 重寄課程邀請信，cid為groupCID
        /// --- 回傳 status bit, message string
        /// </summary>
        [AuthFilter("I")]
        [HttpPut("")]
        public IActionResult ResentInviteEMail([FromBody] ResentInviteCourseModel body)
        {
            int mid = (int)this.HttpContext.Items["MID"];
            int sid = (int)this.HttpContext.Items["SID"];

            DeleteInviteCourseModel deleteInviteE = new DeleteInviteCourseModel
            {
                courseCID = body.courseCID,
                cid = body.cid,
                iid = body.iid
            };

            ResponseOKModel responseOK = new Mail().deleteCourseEMail(this.HttpContext, deleteInviteE, mid, sid);

            if (responseOK.status)
            {
                IviteCourseModel iviteCourse = new IviteCourseModel { 
                    courseCID=body.courseCID,
                    cid = body.cid,
                    email = body.email
                };

                responseOK = new Mail().sendCourseEMail(iviteCourse, mid, sid);
            }

            return Ok(responseOK);
        }

        /// <summary>
        /// 刪除群組邀請信，cid為groupCID
        /// --- 回傳 status bit, message string
        /// </summary>
        [AuthFilter("D")]
        [HttpDelete("")]
        public IActionResult DeleteInviteEMail([FromBody] DeleteInviteCourseModel body)
        {
            int mid = (int)this.HttpContext.Items["MID"];
            int sid = (int)this.HttpContext.Items["SID"];

            ResponseOKModel responseOK = new Mail().deleteCourseEMail(this.HttpContext, body, mid, sid);

            return Ok(responseOK);
        }

       

        /// <summary>
        /// 查詢Token
        /// --- 回傳 status bit, message string
        /// </summary>
        [HttpGet("token")]
        public IActionResult GetToken(string token)
        {
            int mid = (int)this.HttpContext.Items["MID"];
            int sid = (int)this.HttpContext.Items["SID"];

            bool status = false;
            string message = "請先登入";
            if (mid == 0)
            {
                return Ok(new { status, message });
            }

            Guid uuid;

            if (!Guid.TryParse(token, out uuid))
            {
                message = "Token無效";
                return Ok(new { status, message });
            }

            string strsql = @$"select cid, courseName, gname, email, since, expiredDT
                                from vd_AliveToken 
                                where token = @uuid";

            using (var db = new AppDb())
            {

                var data = db.Connection.QueryFirstOrDefault(strsql, new { uuid });

                if (data == null)
                {
                    message = "Token無效";
                    return Ok(new { status, message });
                }

                return Ok(data);
            }
        }
    }
}
