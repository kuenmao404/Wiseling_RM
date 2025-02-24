using Dapper;
using WiseLing_API.Filter;
using WiseLing_API.Lib;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Net.Http.Headers;
using System.IO;
using WiseLing_API.Model;

namespace WiseLing_API.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class FileController : ControllerBase
    {
        /// <summary>
        /// 上傳檔案傳cid代表權線控管，null則公開檔案--- 回傳 status bit, message string, uuid string
        /// </summary>
        [HttpPost("")]
        [AuthNullFilter("I")]
        public async Task<IActionResult> Uploadimg([FromForm] FileModel fileModel)
        {
            int mid = (int)this.HttpContext.Items["MID"];
            int sid = (int)this.HttpContext.Items["SID"];
            FnFile fn = new FnFile();

            uploadFileModel picresult = new uploadFileModel();
            picresult = await fn.PostSinglefile(fileModel, mid, 0, sid, false);

            return Ok(picresult);
        }

        /// <summary>
        /// 取得權限檔案
        /// </summary>
        [HttpGet("")]
        public async Task<IActionResult> GetPermissionFile([FromServices] IConfiguration Configuration, Guid uuid)
        {
            string filePath;
            string[] imgtype = Configuration["AllowFilesType:IMG"].Split(",");

            int mid = (int)this.HttpContext.Items["MID"];

            string strsql = @$"select path, filename, contentType, cast(dataByte as int) as dataByte, dbo.fs_checkUserPermission(cid, @mid, 1) 'permission'
                               from vd_ArchiveClass
                                where uuid = @uuid";

            string? path, filename, contentType;
            bool permission = false;

            JsonResult notfound = new JsonResult(new ResponseModel { status = false, message = "找不到檔案", statusCode = 404 })
            {
                StatusCode = StatusCodes.Status404NotFound,
            };

            using (var db = new AppDb())
            {
                var data = db.Connection.QueryFirstOrDefault(strsql, new { uuid, mid });

                if (data == null)
                {
                    return notfound;
                }

                filePath = new FnFile().getFilePath(false);
                path = data.path;
                filename = data.filename;
                contentType = data.contentType;
                permission = data.permission;
            }
            
            if (!permission)
            {
                return notfound;
            } 

            if (path.IsNullOrEmpty() || filename.IsNullOrEmpty())
            {
                return notfound;
            }

            string SaveFilePath = Path.Combine(filePath, path);
            FileInfo fInfo = new FileInfo(SaveFilePath);
            if (!fInfo.Exists)
            {
                return notfound;
            }

            var memoryStream = new MemoryStream();
            using (var stream = new FileStream(SaveFilePath, FileMode.Open))
            {
                await stream.CopyToAsync(memoryStream);
            }
            memoryStream.Seek(0, SeekOrigin.Begin);

            int imgindex = Array.FindIndex(imgtype, d => d == contentType);

            if (imgindex < 0)
            {
                return File(memoryStream, "application/force-download", filename);
            }
            else 
            {
                var encodedFileName = Uri.EscapeDataString(filename);
                var header = new ContentDispositionHeaderValue("inline")
                {
                    FileName = encodedFileName
                };

                Response.Headers.Add(HeaderNames.ContentDisposition, header.ToString());

                return base.File(memoryStream, contentType);
            }

        }
    }
}
