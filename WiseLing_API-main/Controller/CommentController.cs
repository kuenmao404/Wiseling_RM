using Dapper;
using Microsoft.AspNetCore.Mvc;
using WiseLing_API.Filter;
using WiseLing_API.Lib;

namespace WiseLing_API.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentController : ControllerBase
    {

        #region 根據oid取得Object討論區
        /// <summary>
        /// 根據oid取得Object討論區
        /// </summary>
        /// <param name="oid">影片vid</param>
        /// <param name="start">從第n筆開始</param>
        /// <param name="counts">開始後m筆資料</param>
        /// <remarks>
        /// - order by since desc
        /// </remarks>
        [HttpGet("{oid}")]
        public IActionResult GetObjectForum(int oid, int start = 1, int counts = 10)
        {
            int mid = (int)this.HttpContext.Items["MID"];
            string fetch = @"";

            start = start > 0 ? start : 1;
            counts = counts > 0 ? counts : 1;

            fetch = "order by v.since desc offset @start - 1 row fetch next @counts rows only";


            string strsql_value = @"v.*, cast(iif(mf.MID is null, 0, 1) as bit) 'bMyLike'";

            string strsql_from = @$"from vd_ObjectForum v
                                    left join MF
                                    on MF.FID = v.fid and MF.MID = @mid
                                    where oid = @oid";


            string strsql = @$"select {strsql_value} {strsql_from} {fetch}";

            string strsql_total = @$"select count(*) as total from vd_ObjectForum where oid = @oid";

            using (var db = new AppDb())
            {

                var data = db.Connection.Query(strsql, new { mid, oid, start, counts });
                var total = db.Connection.QueryFirstOrDefault(strsql_total, new { oid });

                return Ok(new { total.total, data });
            }
        }
        #endregion

        #region 根據oid、pfid取得Object子討論區
        /// <summary>
        /// 根據oid、pfid取得Object子討論區
        /// </summary>
        /// <param name="oid">影片vid</param>
        /// <param name="pfid">討論區父fid</param>
        /// <param name="start">從第n筆開始</param>
        /// <param name="counts">開始後m筆資料</param>
        /// <remarks>
        /// order by bBest desc, since
        /// </remarks>
        [HttpGet("{oid}/{pfid}")]
        public IActionResult GetObjectChildForum(int oid, int pfid, int start = 1, int counts = 10)
        {
            int mid = (int)this.HttpContext.Items["MID"];
            string fetch = @"";

            start = start > 0 ? start : 1;
            counts = counts > 0 ? counts : 1;

            fetch = "order by bBest desc, v.since offset @start - 1 row fetch next @counts rows only";


            string strsql_value = @"v.*, cast(iif(mf.MID is null, 0, 1) as bit) 'bMyLike'";

            string strsql_from = @$"from vd_ObjectForumChild v
                                    left join MF
                                    on MF.FID = v.fid and MF.MID = @mid
                                    where oid = @oid and pfid = @pfid";


            string strsql = @$"select {strsql_value} {strsql_from} {fetch}";

            string strsql_total = @$"select count(*) as total from vd_ObjectForumChild where oid = @oid and pfid = @pfid";

            using (var db = new AppDb())
            {

                var data = db.Connection.Query(strsql, new { mid, oid, pfid, start, counts });
                var total = db.Connection.QueryFirstOrDefault(strsql_total, new { oid, pfid });

                return Ok(new { total.total, data });
            }
        }
        #endregion

        #region 根據cid取得Class討論區
        /// <summary>
        /// 根據cid取得Class討論區
        /// </summary>
        /// <param name="cid">討論區cid</param>
        /// <param name="fid">若為null則取得所有，否則取得該討論</param>
        /// <param name="start">從第n筆開始</param>
        /// <param name="counts">開始後m筆資料</param>
        /// <remarks>
        /// - R權限
        /// - order by since desc
        /// </remarks>
        [HttpGet("Class/{cid}")]
        [AuthFilter("R")]
        public IActionResult GetClassForum(int cid, int? fid, int start = 1, int counts = 10)
        {
            int mid = (int)this.HttpContext.Items["MID"];
            string fetch = @"";

            start = start > 0 ? start : 1;
            counts = counts > 0 ? counts : 1;

            fetch = "order by v.since desc offset @start - 1 row fetch next @counts rows only";


            string strsql_value = @"v.*, cast(iif(mf.MID is null, 0, 1) as bit) 'bMyLike'";

            string strsql_from = @$"from vd_ClassForum v
                                    left join MF
                                    on MF.FID = v.fid and MF.MID = @mid
                                    where cid = @cid {(fid == null? "" : "and v.fid = @fid")}";


            string strsql = @$"select {strsql_value} {strsql_from} {(fid == null ? fetch : "") }";

            string strsql_total = @$"select count(*) as total from vd_ClassForum where cid = @cid";

            using (var db = new AppDb())
            {

                if(fid == null)
                {
                    var data = db.Connection.Query(strsql, new { mid, cid, start, counts });
                    var total = db.Connection.QueryFirstOrDefault(strsql_total, new { cid });

                    return Ok(new { total.total, data });
                }
                else{
                    var data = db.Connection.QueryFirstOrDefault(strsql, new { mid, cid, start, counts, fid });
                    return Ok(data);
                }
            }
        }
        #endregion

        #region 根據cid、pfid取得Class子討論區
        /// <summary>
        /// 根據cid、pfid取得Class子討論區
        /// </summary>
        /// <param name="cid">討論區cid</param>
        /// <param name="pfid">討論區父fid</param>
        /// <param name="start">從第n筆開始</param>
        /// <param name="counts">開始後m筆資料</param>
        /// <remarks>
        /// - R權限
        /// order by bBest desc, since
        /// </remarks>
        [HttpGet("Class/{cid}/{pfid}")]
        [AuthFilter("R")]
        public IActionResult GetClassChildForum(int cid, int pfid, int start = 1, int counts = 10)
        {
            int mid = (int)this.HttpContext.Items["MID"];
            string fetch = @"";

            start = start > 0 ? start : 1;
            counts = counts > 0 ? counts : 1;

            fetch = "order by bBest desc, v.since offset @start - 1 row fetch next @counts rows only";


            string strsql_value = @"v.*, cast(iif(mf.MID is null, 0, 1) as bit) 'bMyLike'";

            string strsql_from = @$"from vd_ClassForumChild v
                                    left join MF
                                    on MF.FID = v.fid and MF.MID = @mid
                                    where cid = @cid and pfid = @pfid";


            string strsql = @$"select {strsql_value} {strsql_from} {fetch}";

            string strsql_total = @$"select count(*) as total from vd_ClassForumChild where cid = @cid and pfid = @pfid";

            using (var db = new AppDb())
            {

                var data = db.Connection.Query(strsql, new { mid, cid, pfid, start, counts });
                var total = db.Connection.QueryFirstOrDefault(strsql_total, new { cid, pfid });

                return Ok(new { total.total, data });
            }
        }
        #endregion

    }
}
