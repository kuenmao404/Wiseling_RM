using Dapper;
using WiseLing_API.Filter;
using WiseLing_API.Lib;
using WiseLing_API.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.Data;
using System.Reflection;
using System.Diagnostics.Metrics;

namespace WiseLing_API.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class CourseController : ControllerBase
    {
        private readonly HttpClient _httpClient;

        // 通過依賴注入獲取 HttpClient
        public CourseController(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        /// <summary>
        /// 取得課程詳細內容，包括子目錄cid
        /// </summary>
        [HttpGet("{cid}")]
        [AuthFilter("V")]
        public IActionResult GetCourse(int cid)
        {
            int mid = (int)this.HttpContext.Items["MID"];
            string strsql = @"select * from vd_Course where cid = @cid";

            string strsql_subclass = @"select cid, cname, ename, type 
                                    from vd_CourseNext
                                    where courseCID = @cid and dbo.fs_checkUserPermission(courseCID, @mid, 0) = 1";

            string strsql_permission = @"exec xp_getCourseMemberPermission @cid, @mid";

            string strsql_applyCount = @"select count(*) 'applyCount'
                                    from ApplyHistoryCourse
                                    where CourseCID  = @cid and ApplyStatus = 0 and bDel = 0";


            using (var db = new AppDb())
            {

                var course = db.Connection.QueryFirstOrDefault(strsql, new { cid });

                var subclass = db.Connection.Query(strsql_subclass, new { cid, mid });

                var permission = db.Connection.QueryFirstOrDefault(strsql_permission, new { cid, mid });

                if(permission.isCourseManager || permission.isCourseMember)
                {
                    var applyCount = db.Connection.QueryFirstOrDefault(strsql_applyCount, new { cid });

                    return Ok(new { course, subclass, permission, applyCount.applyCount });
                }

                return Ok(new { course, subclass, permission });
            }
        }

        /// <summary>
        /// 新增課程，courseStatus 0|1 (公開|私人) ；joinStatus 0|1|2 (直接加入|申請加入|不開放)；回傳status、message
        /// </summary>
        [HttpPost("")]
        public async Task<IActionResult> CreateCourse([FromForm] CreateCourse body)
        {
            int mid = (int)this.HttpContext.Items["MID"];
            int sid = (int)this.HttpContext.Items["SID"];

            if(mid <= 0)
            {
                return Ok(new myUnauthorizedResult("登入後解鎖"));
            }

            FnFile fn = new FnFile();

            FileModel fileModel = new FileModel
            {
                cid = null,
                files = body.files
            };

            uploadFileModel picresult = new uploadFileModel();
            picresult = await fn.PostSinglefile(fileModel, mid, 0, sid, true);

            if (!picresult.status)
            {
                return Ok(new { picresult.status, picresult.message });
            }

            bool status;
            string message;
            int? cid;

            string strSql = "xp_insertCourse";
            this.HttpContext.Items.Add("ObjectName", strSql);

            using (var db = new AppDb())
            {
                var p = new DynamicParameters();
                p.Add("@courseName", body.courseName);
                p.Add("@courseDes", body.courseDes);
                p.Add("@tags", body.tags);
                p.Add("@courseStatus", body.courseStatus);
                p.Add("@joinStatus", body.joinStatus);
                p.Add("@oid_archive", picresult.oid);
                p.Add("@mid", mid);
                p.Add("@sid", sid);
                p.Add("@cid_course", dbType: DbType.Int32, direction: ParameterDirection.Output);
                p.Add("@status", dbType: DbType.Boolean, direction: ParameterDirection.Output);
                p.Add("@message", dbType: DbType.String, direction: ParameterDirection.Output, size: 255);
                db.Connection.Execute(strSql, p, commandType: CommandType.StoredProcedure);
                status = p.Get<bool>("@status");
                message = p.Get<string>("@message");
                cid = p.Get<int?>("@cid_course");

                this.HttpContext.Items.Add("SP_InOut", p);

                 return Ok(new { status, message, cid });   
            }

        }


        /// <summary>
        /// 編輯課程，courseStatus 0|1 (公開|私人) ；joinStatus 0|1|2 (直接加入|申請加入|不開放)；回傳status、message
        /// </summary>
        [HttpPut("{cid}")]
        [AuthFilter("U")]
        public async Task<IActionResult> EditCourse(int cid, [FromForm] UpdateCourse body)
        {
            int mid = (int)this.HttpContext.Items["MID"];
            int sid = (int)this.HttpContext.Items["SID"];

            FnFile fn = new FnFile();

            FileModel fileModel = new FileModel
            {
                cid = null,
                files = body.files
            };

            uploadFileModel picresult = new uploadFileModel();
            picresult = await fn.PostSinglefile(fileModel, mid, 0, sid, true);


            if (!picresult.status)
            {
                return Ok(new { picresult.status, picresult.message });
            }

            bool status;
            string message;

            string strSql = "xp_updateCourse";
            this.HttpContext.Items.Add("ObjectName", strSql);

            using (var db = new AppDb())
            {
                var p = new DynamicParameters();
                p.Add("@cid", cid);
                p.Add("@courseName", body.courseName);
                p.Add("@courseDes", body.courseDes);
                p.Add("@tags", body.tags);
                p.Add("@courseStatus", body.courseStatus);
                p.Add("@joinStatus", body.joinStatus);
                p.Add("@ownerMID", body.ownerMID);
                p.Add("@oid_archive", picresult.oid);
                p.Add("@mid", mid);
                p.Add("@sid", sid);
                p.Add("@status", dbType: DbType.Boolean, direction: ParameterDirection.Output);
                p.Add("@message", dbType: DbType.String, direction: ParameterDirection.Output, size: 255);
                db.Connection.Execute(strSql, p, commandType: CommandType.StoredProcedure);
                status = p.Get<bool>("@status");
                message = p.Get<string>("@message");

                this.HttpContext.Items.Add("SP_InOut", p);

                return Ok(new { status, message });
                
            }
            
        }


        /// <summary>
        /// 刪除課程，回傳status、message
        /// </summary>
        [HttpDelete("{cid}")]
        [AuthFilter("D")]
        public async Task<IActionResult> DeleteCourse(int cid, [FromBody] DeleteCourse body)
        {
            int mid = (int)this.HttpContext.Items["MID"];
            int sid = (int)this.HttpContext.Items["SID"];

            bool status;
            string message;
            using (var db = new AppDb())
            {
                string strSql = "xp_DeleteCourse";
                var p = new DynamicParameters();
                p.Add("@cid", cid);
                p.Add("@courseName", body.courseName);
                p.Add("@mid", mid);
                p.Add("@sid", sid);
                p.Add("@status", dbType: DbType.Boolean, direction: ParameterDirection.Output);
                p.Add("@message", dbType: DbType.String, direction: ParameterDirection.Output, size: 255);
                db.Connection.Execute(strSql, p, commandType: CommandType.StoredProcedure);
                status = p.Get<bool>("@status");
                message = p.Get<string>("@message");

                this.HttpContext.Items.Add("ObjectName", strSql);
                this.HttpContext.Items.Add("SP_InOut", p);

                return Ok(new { status, message });
            }

        }

        /// <summary>
        /// 取得課程成員並包含可否踢出、更改成員權限
        /// </summary>
        [HttpGet("Member/{cid}")]
        [AuthFilter("R")]
        public IActionResult GetCourseMember(int cid, int? start, int? counts, string? searchstr)
        {
            int mid = (int)this.HttpContext.Items["MID"];
            string fetch = "", like = "";

            if (start != null && counts != null)
            {
                fetch = "offset @start - 1 row fetch next @counts rows only";
            }

            if (!searchstr.IsNullOrEmpty())
            {
                like = "and t.name like @searchstr + '%'";
            }

            string strsqlfrom = $@"from vd_CourseClassGroupMember t
		            left join vd_MemberGroup my
		            on my.MID = @mid and my.GDes = t.gename and my.ID = t.courseCID
                    where t.courseCID = @cid {like}";

            string strsql = @$"select t.[courseCID], t.[courseName], t.[cid], t.[gname], t.[gename], t.[mid], t.[name], t.[sso], t.[since], t.[lastLoginDT], t.bPrev
			            , dbo.fn_checkClassGroupPermission(t.cid, @mid, 3, my.Role, t.role) 'bDelete'
			            , dbo.fn_checkClassGroupPermission(t.cid, @mid, 4, my.Role, t.role) 'bUpdate'
                        {strsqlfrom} order by cid, lastLoginDT desc {fetch}";
           

            string strsql_total = $@"select count(*) 'total' {strsqlfrom}";

            using (var db = new AppDb())
            {

                var data = db.Connection.Query(strsql, new { cid, mid, start, counts, searchstr });

                if (!fetch.IsNullOrEmpty())
                {
                    var total = db.Connection.QueryFirstOrDefault(strsql_total, new { cid, mid, searchstr });

                    return Ok(new { total.total, data });
                }
               
                return Ok(data);
            }
        }


        /// <summary>
        /// 取得課程章節與影片，判斷V (章節) 與R (影片) 權限
        /// </summary>
        [HttpGet("ChapterAndVideo/{cid}")]
        [AuthFilter("V")]
        public IActionResult GetChapterAndVideo(int cid)
        {
            int mid = (int)this.HttpContext.Items["MID"];
            PermissionModel permissionModel = (PermissionModel)this.HttpContext.Items["PermissionModel"];

            string itemsql = @"null";
            if (permissionModel.R)
            {
                itemsql = @"(select * from vd_CourseChapterItem where courseCID = @cid and cid = v.cid order by rank for json auto, INCLUDE_NULL_VALUES)";
            }

            string strsql = @$"select (
	                            select v.* , {itemsql} 'items'
	                            from vd_CourseChapter v
                                where v.courseCID = @cid
	                            order by v.rank
	                            for json auto, INCLUDE_NULL_VALUES
                            ) 'data'
                            ";

            using (var db = new AppDb())
            {

                var data = db.Connection.QueryFirstOrDefault(strsql, new { cid });

                var response = data.data ?? "[]";

                return Ok(response);
            }
        }


        /// <summary>
        /// 新增物件至章節，type：18|20 (影片|題目)，bYouTube為true則使用YouTubeAPI必須傳url；回傳status、message
        /// </summary>
        [HttpPost("ChapterVideoYoutubeAPI/{cid}")]
        [AuthFilter("I")]
        public IActionResult ChapterVideoYoutubeAPI(int cid, [FromBody] InsertVideoToChapter body)
        {
            int mid = (int)this.HttpContext.Items["MID"];
            int sid = (int)this.HttpContext.Items["SID"];

            int? oid = body.oid;
            string oid_str = "";
            if (body.type == 18)
            {
                if (body.bYoutube)
                {
                    Response_YTAPI response = new YoutubeAPI().getVideoOrPlayList(_httpClient,sid, body.url, body.bPlayList ? 1 : 0);
                    if (!response.status)
                    {
                        return Ok(new { response.status, response.message });
                    }
                    oid = response.vid;
                    oid_str = response.vid_str;
                }
            }

            bool status;
            string message;
            var p = new DynamicParameters();

            if (body.bPlayList)
            {
                string strSql = "xp_insertCourseChapterItem_PlayList";
                this.HttpContext.Items.Add("ObjectName", strSql);

                using (var db = new AppDb())
                {
                    p.Add("@courseCID", body.courseCID);
                    p.Add("@cid", cid);
                    p.Add("@oid_str", oid_str);
                    p.Add("@mid", mid);
                    p.Add("@sid", sid);
                    p.Add("@status", dbType: DbType.Boolean, direction: ParameterDirection.Output);
                    p.Add("@message", dbType: DbType.String, direction: ParameterDirection.Output, size: 255);
                    db.Connection.Execute(strSql, p, commandType: CommandType.StoredProcedure);
                    status = p.Get<bool>("@status");
                    message = p.Get<string>("@message");
                }
            }
            else
            {
                string strSql = "xp_insertCourseChapterItem";
                this.HttpContext.Items.Add("ObjectName", strSql);

                using (var db = new AppDb())
                {
                    p.Add("@courseCID", body.courseCID);
                    p.Add("@cid", cid);
                    p.Add("@type", body.type);
                    p.Add("@oid", oid);
                    p.Add("@mid", mid);
                    p.Add("@sid", sid);
                    p.Add("@status", dbType: DbType.Boolean, direction: ParameterDirection.Output);
                    p.Add("@message", dbType: DbType.String, direction: ParameterDirection.Output, size: 255);
                    db.Connection.Execute(strSql, p, commandType: CommandType.StoredProcedure);
                    status = p.Get<bool>("@status");
                    message = p.Get<string>("@message");
                }
            }

            this.HttpContext.Items.Add("SP_InOut", p);

            return Ok(new { status, message });    
        }

        #region 根據CourseCID、cid、mid、year取得課程馬賽克磚
        /// <summary>
        /// 根據CourseCID、cid、mid、year取得課程馬賽克磚
        /// </summary>
        /// <param name="CourseCID">課程cid</param>
        /// <param name="cid">學習紀錄cid</param>
        /// <param name="mid">可不傳，查詢特定會員學習紀錄</param>
        /// <param name="year">年份</param>
        /// <remarks>
        /// - V權限
        /// </remarks>
        [HttpGet("CalenderHeatMap/{CourseCID}")]
        [AuthFilter("V")]
        public IActionResult GetMap(int CourseCID, int cid, int? mid, string year = "2024")
        {

            string strsql = @$"select mapID, date, nC
                                from vd_CourseCalender 
                                where courseCID = @CourseCID and CID = @cid and year(Date) = @year";

            if(mid != null)
            {
                strsql = $@"select mapID, date, count(*) as nC
                            from vd_CourseCalenderHeatMap		
                            where courseCID = @CourseCID and cid = @cid and mid = @mid and year(Date) = @year
                            group by mapID, date
                            ";
            }
           
            using (var db = new AppDb())
            {

                var data = db.Connection.Query(strsql, new { CourseCID, mid, year, cid });

                return Ok(data);
            }
        }
        #endregion

        /// <summary>
        /// 課程章節+，影片版
        /// </summary>
        [HttpGet("Chapter/{cid}")]
        [AuthFilter("I")]
        public IActionResult ChapterAddItem(int courseCID, int cid, string? searchstr, int start = 1, int counts = 10)
        {
            int mid = (int)this.HttpContext.Items["MID"];

            string fetch = @"";

            start = start > 0 ? start : 1;

            counts = counts < 1 ? 1 : counts;

            fetch = "order by n.nO desc offset @start - 1 row fetch next @counts rows only";

            string where = "where n.nO > 0";
            if (!searchstr.IsNullOrEmpty())
            {
                where = " where v.title like '%' + @searchstr + '%'";
            }


            string strsql_value = @"v.* , n.nO, cast(iif(c.vid is null, 0, 1) as bit) as bChoose";
            string strsql_from = @$"from vd_Video v
                                left join vd_MemberClassNoteVideo n
                                on v.vid = n.vid and n.MID = @mid and n.nO > 0
                                left join vd_CourseChapterVideo c
                                on c.courseCID = @courseCID and c.cid = @cid and c.vid = v.vid ";


            string strsql = @$"select {strsql_value} {strsql_from} {where} {fetch}";

            string strsql_total = @$"select count(*) as total {strsql_from} {where}";

            using (var db = new AppDb())
            {

                var data = db.Connection.Query(strsql, new { cid, courseCID, mid, searchstr, start, counts });
                var total = db.Connection.QueryFirstOrDefault(strsql_total, new { cid, courseCID, mid, searchstr });

                return Ok(new { total.total, data });
            }
        }

        #region 取得個人筆記 (匯入課程教材)
        /// <summary>
        ///取得個人筆記 (匯入課程教材)
        /// </summary>
        /// <param name="cid">課程教材cid</param>
        /// <param name="courseCID">課程cid</param>
        /// <param name="notebookCID">筆記本cid</param>
        /// <param name="vid">影片vid</param>
        /// <remarks>
        /// - I權限
        /// - bExists：有無已匯入
        /// </remarks>
        [HttpGet("ImportNote/{cid}")]
        [AuthFilter("I")]
        public IActionResult ImportMyNote2CourseTeach(int cid, int courseCID, int notebookCID, int vid)
        {
            int mid = (int)this.HttpContext.Items["MID"];

            string strsql = @$" select v.*, cast(iif(c.contentNTID is null, 0, 1) as bit) as bExists
                                from vd_MemberNoteClass_Front v
                                left join vd_CourseTeachVideoNote c
                                on c.vid = @vid and courseCID = @courseCID and c.cid = @cid 
	                                and cast(c.startTime as int) <= cast(v.startTime as int) 
	                                and isnull(cast(c.endTime as int), c.startTime) >= isnull(cast(v.endTime as int), v.startTime) 
                                where v.mid = @mid and v.vid = @vid and v.cid  = @notebookCID
                                order by v.startTime 
                                ";

           
            using (var db = new AppDb())
            {

                var data = db.Connection.Query(strsql, new { cid, courseCID, vid, mid, notebookCID });

                return Ok(data);
            }
        }
        #endregion
    }
}
