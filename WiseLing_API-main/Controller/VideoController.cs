using Azure;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using WiseLing_API.Filter;
using WiseLing_API.Lib;
using WiseLing_API.Model;

namespace WiseLing_API.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class VideoController : ControllerBase
    {
        private readonly HttpClient _httpClient;

        // 通過依賴注入獲取 HttpClient
        public VideoController(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        /// <summary>
        /// 新增YouTube影片或播放清單，回傳status、message
        /// </summary>
        [HttpPost("Youtube")]
        public IActionResult InsertVideoOrPlaylist([FromBody] YoutubeAPIModel body)
        {
            int mid = (int)this.HttpContext.Items["MID"];

            if(mid <= 0)
            {
                return Ok(new ResponseOKModel("只有會員擁有此功能", false));
            }

            int sid = (int)this.HttpContext.Items["SID"];
            
            Response_YTAPI response = new YoutubeAPI().getVideoOrPlayList(_httpClient, sid, body.url, body.bPlayList ? 1 : 0);
            
            return Ok(response);

        }


        #region 新增筆記本至影片收藏清單資料夾
        /// <summary>
        /// 新增影片或筆記本至收藏清單資料夾
        /// </summary>
        /// <param name="cid">資料夾cid</param>
        /// <remarks>
        /// ## 需要I權限
        /// ## Body
        /// - idstr：id字串組合 "1,2,3,4"
        /// - mode：video | notebook
        /// - bYoutube：是否youtube
        /// - bPlayList：是否播放清單
        /// - url：YouTube網址
        /// </remarks>
        [HttpPost("VList/{cid}")]
        [AuthFilter("I")]
        public IActionResult InsVListVideo(int cid, [FromBody] InsVListVideo body)
        {
            int mid = (int)this.HttpContext.Items["MID"];
            int sid = (int)this.HttpContext.Items["SID"];

            string vid_str = "";
            if (body.bYoutube)
            {
                Response_YTAPI response = new YoutubeAPI().getVideoOrPlayList(_httpClient, sid, body.url, body.bPlayList ? 1 : 0);
                if (!response.status)
                {
                    return Ok(new { response.status, response.message });
                }
                vid_str = response.vid_str;
            }

            bool status;
            string message;
            var p = new DynamicParameters();
           
            string strSql = "xp_insertVListVideo";
            this.HttpContext.Items.Add("ObjectName", strSql);

            using (var db = new AppDb())
            {
                p.Add("@cid", cid);
                p.Add("@idstr", body.bYoutube ? vid_str : body.idstr);
                p.Add("@mode", body.mode);
                p.Add("@mid", mid);
                p.Add("@sid", sid);
                p.Add("@status", dbType: DbType.Boolean, direction: ParameterDirection.Output);
                p.Add("@message", dbType: DbType.String, direction: ParameterDirection.Output, size: 255);
                db.Connection.Execute(strSql, p, commandType: CommandType.StoredProcedure);
                status = p.Get<bool>("@status");
                message = p.Get<string>("@message");
            }
            
            this.HttpContext.Items.Add("SP_InOut", p);

            return Ok(new { status, message });
        }
        #endregion


    }
}
 