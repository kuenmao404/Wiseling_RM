using Dapper;
using WiseLing_API.Filter;
using WiseLing_API.Lib;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Net.Http.Headers;
using System.Security.Cryptography;
using WiseLing_API.Model;
using WiseLing_API.Model;

namespace WiseLing_API.Controller
{
    [ApiController]
    [Route("assets")]
    public class Assets : ControllerBase
    {
        /// <summary>
        /// 取得公開檔案
        /// </summary>
        [HttpGet("")]
        public async Task<IActionResult> GetFile([FromServices] IConfiguration Configuration, Guid uuid)
        {
            var filePath = Configuration["File:StoredFilesPath"];
            string[] imgtype = Configuration["AllowFilesType:IMG"].Split(",");

            string strsql = @$"select path, filename, contentType from vd_Archive_Pub where uuid = @uuid";

            string? path, filename, contentType;

            JsonResult notfound = new JsonResult(new ResponseModel { status = false, message = "找不到檔案", statusCode = 404 })
            {
                StatusCode = StatusCodes.Status404NotFound,
            };

            using (var db = new AppDb("PublicRead"))
            {
                var data = db.Connection.QueryFirstOrDefault(strsql, new { uuid });

                if (data == null)
                {
                    return notfound;
                }
                path = data?.path;
                filename = data?.filename;
                contentType = data?.contentType;
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

        /// <summary>
        /// 取得it108公開檔案
        /// </summary>
        [HttpGet("it108")]
        public async Task<IActionResult> GetIT108File([FromServices] IConfiguration Configuration, string path)
        {
            var filePath = Configuration["File:IT108"];
            string[] imgtype = Configuration["AllowFilesType:IMG"].Split(",");



            JsonResult notfound = new JsonResult(new ResponseModel { status = false, message = "找不到檔案", statusCode = 404 })
            {
                StatusCode = StatusCodes.Status404NotFound,
            };

            if (path.IsNullOrEmpty() )
            {
                return notfound;
            }

            string[] pathsplit = path.Split("/");
            string filename = pathsplit[3];

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
            
            return File(memoryStream, "application/force-download", filename);

        }
    }
}
