using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace WiseLing_API.Model
{
    public class ResponseModel
    {
        public string? message { get; set; }
        public int statusCode { get; set; }
        public bool status { get; set; }

        public string ToJson()
        {
            return JsonConvert.SerializeObject(this);
        }
        public ResponseModel(string message2 = "API發生錯誤",int statusCode2 = 500, bool status2 = false)
        {
            message = message2;
            statusCode = statusCode2;
            status = status2;
        }
    }

    public class ResponseOKModel
    {
        public string message { get; set; }
        public bool status { get; set; }

        public ResponseOKModel(string message2 = "錯誤", bool status2 = false)
        {
            message = message2;
            status = status2;
        }
    }

    public class InvalidModelBinding
    {
        public int statusCode { get; set; }
        public bool status { get; set; }

        public List<ErrorParam> errorArray { get; set; }

    }

    public class ErrorParam
    {
        public string field { get; set; }
        public string? displayName { get; set; }
        public string error { get; set; }

    }

    public class JudgeErrorResponse 
    {
        // <example>456645</example>
        public string? message { get; set; }
        public int statusCode { get; set; }
        public bool status { get; set; }

    }



    public class InternalServerError : JsonResult
    {
        public InternalServerError(string message2 = "API發生錯誤", int StatusCode2 = 500, bool status2 = false) : base(new ResponseModel(message2, StatusCode2, status2))
        {
            StatusCode = StatusCodes.Status500InternalServerError;
        }
    }
}
