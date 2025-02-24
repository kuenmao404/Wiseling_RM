using Dapper;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Text;
using WiseLing_API.Lib;
using WiseLing_API.Model;

namespace WiseLing_API.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class NoteController : ControllerBase
    {
        /// <summary>
        /// 上傳檔案--- 回傳 status bit, message string, uuid string
        /// </summary>
        [HttpPost("Docx/{vid}/{cid}")]
        public async Task<IActionResult> DowndloadWord(int vid, int cid)
        {
            int mid = (int)this.HttpContext.Items["MID"];
            int sid = (int)this.HttpContext.Items["SID"];


            NoteFileDownload? noteFileDownload = await new Fn().getNotePDForDocx(mid, vid, cid, 0);

            if (noteFileDownload != null)
            {
                return File(noteFileDownload.content, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", noteFileDownload.filename);
            }

            ResponseOKModel responseOKModel = new ResponseOKModel();
            return Ok(responseOKModel);
        }

        /// <summary>
        /// 上傳檔案--- 回傳 status bit, message string, uuid string
        /// </summary>
        [HttpPost("PDF/{vid}/{cid}")]
        public async Task<IActionResult> DowndloadPDF(int vid, int cid)
        {
            int mid = (int)this.HttpContext.Items["MID"];
            int sid = (int)this.HttpContext.Items["SID"];


            NoteFileDownload? noteFileDownload = await new Fn().getNotePDForDocx(mid, vid, cid, 0);

            if (noteFileDownload != null)
            {
                return File(noteFileDownload.content, "application/pdf", noteFileDownload.filename);
            }

            ResponseOKModel responseOKModel = new ResponseOKModel();
            return Ok(responseOKModel);
        }
    }
}
