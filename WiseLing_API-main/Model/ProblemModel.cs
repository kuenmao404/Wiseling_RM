using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Swashbuckle.AspNetCore.Annotations;

namespace WiseLing_API.Model
{
    public class uploadSolution
    {
        public int cid { get; set; }
        public IFormFile? file { get; set; }
        public int plid { get; set; }
        public string? code { get; set; }
    }

    public class solveJudge
    {
        public int plid { get; set; }
        public string? code { get; set; }
        public IFormFile? file { get; set; }
    }

    public class runJudge
    {
        /// <summary>
        /// ProgramingLanguage，語言id
        /// </summary>
        [Required]
        public int plid { get; set; }

        /// <summary>
        /// 使用者程式碼檔案
        /// </summary>
        [Required]
        public IFormFile source { get; set; }

        /// <summary>
        /// 自訂測資，檔案類型只允許text/plain
        /// </summary>
        [Required]
        public IFormFile input { get; set; }
    }

    public class SolutionRun
    {
        /// <summary>
        /// 自訂測資，檔案類型只允許text/plain
        /// </summary>
        [Required]
        public IFormFile input { get; set; }
    }

    public class RunJudgeResponse
    {
        public bool status { get; set; } = false;
        public string? kind { get; set; } 
        public string message { get; set; } 
        public string output { get; set; }
        public int? runtime { get; set; }
        public int? memory { get; set; }
    }

    public class JudgeBad
    {
        public bool status { get; set; } = true;
        public string message { get; set; } = "Judge錯誤";
    }


    public class UploadTestCaseModel
    {
        public int cid { get; set; }
        public string? input { get; set; }
        public string? output { get; set; }
        public IFormFile? inputFile { get; set; }
        public IFormFile? outputFile { get; set; }
    }
    public class DeleteTestCaseModel
    {
        public int cid { get; set; }
        public int tcid { get; set; }
    }
    public class JudgeSolveResModel
    {
        public bool? status { get; set; } = false;
        public string? message { get; set; } = "Judge錯誤";
        public string? kind { get; set; }
        public string? runTime { get; set; }
        public string? memory { get; set; }
    }
    public class JudgeTestCaseResModel
    {
        public bool? status { get; set; } = false;
        public string? message { get; set; } = "Judge錯誤";
        public string? in_md5 { get; set; }
        public string? output { get; set; }
        public string? out_md5 { get; set; }
        public int? tid { get; set; }
    }

    public class CodeAndFileModel
    {
        public string? code { get; set; }
        public string filename { get; set; } = "byCode";
        public string contentType { get; set; } = "text/plain";
        public string fileExtension { get; set; } = ".txt";
        public bool status { get; set; } = false;
        public string message { get; set; } = "";
    }
}
