using Microsoft.AspNetCore.Mvc;
using WiseLing_API.Lib;
using Dapper;
using WiseLing_API.Model;
using WiseLing_API.Filter;
using Newtonsoft.Json.Linq;
using System.Data;
using Microsoft.IdentityModel.Tokens;
using System.Diagnostics.Metrics;

namespace WiseLing_API.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class MemberController : ControllerBase
    {
        private readonly DIModel _diModel;

        public MemberController(DIModel diModel)
        {
            _diModel = diModel;
        }

        /// <summary>
        /// 取得我的會員資訊
        /// </summary>
        [HttpGet("")]
        public IActionResult GetMember()
        {
            int mid = (int)this.HttpContext.Items["MID"];
            string strsql = @"select mid, name, nickName, ssoName,img, email, sso, classID, lastLoginDT, since, data, bOP, bJudgeOP
                            from vd_MemberOP
                            where mid = @mid";

            //_diModel.ResponseBodyLog = true;

            using (var db = new AppDb())
            {

                var data = db.Connection.QueryFirstOrDefault(strsql, new { mid });
                return Ok(data);
            }
        }

        /// <summary>
        /// 取得他人會員資訊
        /// </summary>
        [HttpGet("{mid}")]
        public IActionResult GetMemberInfo(int mid)
        {
            string strsql = @"select mid, name, nickName, ssoName, img, sso, lastLoginDT, since
                            from vs_Member
                            where mid = @mid and mid != 0";

            using (var db = new AppDb())
            {

                var data = db.Connection.QueryFirstOrDefault(strsql, new { mid });
                return Ok(data);
            }
        }

        /// <summary>
        /// 取得我的筆記本，隨選播放清單 +
        /// </summary>
        [HttpGet("PList")]
        public IActionResult GetpPList(string? searchstr, int start = 1, int counts = 10)
        {
            int mid = (int)this.HttpContext.Items["MID"];
            string fetch = @"";

            start = start > 0 ? start : 1;

            fetch = "order by v.lastModifiedDT desc offset @start - 1 row fetch next @counts rows only";
            

            string strsql_value = @"v.cid, v.cname, v.vid, v.videoID, v.title, v.lastModifiedDT, v.nO, 0 as nO_Search, cast(0 as bit) as bSearchTitle";
            string strsql_from = @$"from vd_MemberClassNoteBook_New v
                              where OwnerMID = @mid and nO > 0";


            string strsql = @$"select {strsql_value} {strsql_from} {fetch}";

            string strsql_total = @$"select count(*) as total {strsql_from}";


            if (!searchstr.IsNullOrEmpty())
            {
                strsql_value = @"v.cid, v.cname, v.vid, v.videoID, v.title, v.lastModifiedDT, v.nO, 
                                    isnull(t.nO_Search, 0) 'nO_Search', cast(iif(v2.vid is null, 0, 1) as bit) 'bSearchTitle'";

                string strsql_with = @"with t as(
	                                    select vid, count(*) as nO_Search
	                                    from vd_Note
	                                    where content like '%' + @searchstr + '%' and ownerMID = @mid
	                                    group by vid
                                    )";

                strsql_from = @$"from vd_MemberClassNoteBook_New v
                            left join t
                            on  v.vid = t.vid
                            left join vd_MemberClassNoteBook_New v2
                            on (v2.title + v2.cname) like '%' + @searchstr + '%' and v2.OwnerMID = @mid and v2.vid = v.vid
                            where v.OwnerMID = @mid and (t.nO_Search is not null or v2.vid is not null) and v.nO > 0";

                strsql = @$"{strsql_with} select {strsql_value} {strsql_from} {fetch}";

                strsql_total =  @$"{strsql_with} select count(*) as total {strsql_from}";
            }

            using (var db = new AppDb())
            {

                var data = db.Connection.Query(strsql, new { mid, searchstr, start, counts });
                var total = db.Connection.QueryFirstOrDefault(strsql_total, new { mid, searchstr });

                return Ok(new { total.total, data });
            }
        }


        /// <summary>
        /// 取得會員馬賽克磚
        /// </summary>
        [HttpGet("CalenderHeatMap")]
        public IActionResult GetMap(int mid, string year = "2024")
        {
            string strsql = @$"select v.mid, v.cid, 
	                            (select c.mapID, c.date, c.nC from CalendarHeatMap c where v.CID = c.CID and year(c.Date) = @year for json auto) 'data'
                            from vd_ClassMemberNext v
                            where v.type = 13 and mid = @mid";

            using (var db = new AppDb())
            {

                var data = db.Connection.QueryFirstOrDefault(strsql, new { mid, year });

                return Ok(data ?? new { });
            }
        }

        /// <summary>
        /// 轉移IT108使用者資料；回傳status、message、state用於導網址
        /// </summary>
        [HttpPost("Transfer/IT108")]
        public IActionResult TranserIT108([FromBody] TransferIT108Model body)
        {
            int mid = (int)this.HttpContext.Items["MID"];
            int sid = (int)this.HttpContext.Items["SID"];

            string strSql = "xp_IT108_Move_User";
            this.HttpContext.Items.Add("ObjectName", strSql);

            using (var db = new AppDb())
            {
                var p = new DynamicParameters();
                p.Add("@mid", mid);
                p.Add("@sid", sid);
                p.Add("@status", dbType: DbType.Boolean, direction: ParameterDirection.Output);
                p.Add("@message", dbType: DbType.String, direction: ParameterDirection.Output, size: 255);
                db.Connection.Execute(strSql, p, commandType: CommandType.StoredProcedure);
                bool status = p.Get<bool>("@status");
                string message = p.Get<string>("@message");
                
                this.HttpContext.Items.Add("SP_InOut", p);

                return Ok(new { status, message, body.state });

            }

        }

        #region 根據cid取得收藏清單資料夾內容
        /// <summary>
        /// 根據cid取得收藏清單資料夾內容
        /// </summary>
        /// <param name="cid">資料夾cid</param>
        /// <remarks>
        /// - 需擁有cid，R權限
        /// order by rank
        /// </remarks>
        [HttpGet("Folder/{cid}")]
        [AuthFilter("R")]
        public IActionResult GetClassChildForum(int cid, int ownerMID)
        {
            int mid = (int)this.HttpContext.Items["MID"];

            string strsql_Root = @$"select *, dbo.fn_getClassPCID(@cid) as pcid from vd_VListNew where cid = @cid and ownerMID = @ownerMID";
            string strsql_Child = @$"select * from vd_VListNewSubClass where pcid = @cid and ownerMID = @ownerMID order by rank";
            string strsql_notebook = @$"select cid as notebookCID, notebookName, nO, nC, hide, lastModifiedDT, 
                    vid, title, videoID, channelCID, channelTitle, channelID, rank 
                    from vd_VListVideo 
                    where vListCID = @cid and ownerMID = @ownerMID order by rank";

            using (var db = new AppDb())
            {
                var root = db.Connection.QueryFirstOrDefault(strsql_Root, new { cid, ownerMID });
                var folder = db.Connection.Query(strsql_Child, new { cid, ownerMID });
                var notebook = db.Connection.Query(strsql_notebook, new { cid, ownerMID });

                return Ok(new { root, folder, notebook });
            }
        }
        #endregion

    }
}
