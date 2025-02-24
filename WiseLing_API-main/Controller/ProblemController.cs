using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.Data;
using System.Net.Http.Headers;
using System.Text;
using WiseLing_API.Filter;
using WiseLing_API.Lib;
using WiseLing_API.Model;

namespace WiseLing_API.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProblemController : ControllerBase
    {
        private readonly HttpClient _httpClient;

        // 通過依賴注入獲取 HttpClient
        public ProblemController(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        /// <summary>
        /// 取得後台目錄
        /// </summary>
        [HttpGet("BackSide/{pid}")]
        public async Task<IActionResult> uploadSolution(int pid)
        {
            int mid = (int)this.HttpContext.Items["MID"];

            string strsql = @";with t as(
	                            select pid, cid, type, cname 
	                            from vd_ClassProblem
	                            where pid = @pid
                            )
                            select *
                            from t 
                            where dbo.fs_checkUserPermission(cid, @mid, 0) = 1
                            ";

            using (var db = new AppDb())
            {

                var data = db.Connection.Query(strsql, new { mid, pid });
                return Ok(data);
            }

        }

        /// <summary>
        /// 解題
        /// </summary>
        [HttpPost("{pid}")]
        public async Task<IActionResult> solveJudge(int pid, [FromForm] solveJudge body)
        {
            int mid = (int)this.HttpContext.Items["MID"];
            int sid = (int)this.HttpContext.Items["SID"];

            if (mid == 0)
            {
                JsonResult Unauthorized = new JsonResult(new ResponseModel { status = false, message = "登入後解鎖", statusCode = 401 })
                {
                    StatusCode = StatusCodes.Status401Unauthorized,
                };
                return Unauthorized;
            }

            var config = AppConfig.Config;
            int size_limit = new Param().ConvertType<int>(config["JudgeAPI:size_limit"]);
            string judgeapi_solve = config["JudgeAPI:solve"];
            string judgeapi = config["JudgeAPI:base_uri"];

            CodeAndFileModel codeAndFile = await new FnFile().checkJudgeCodeAndFile(body.code, body.file, size_limit);

            if (!codeAndFile.status)
            {
                return Ok(new { codeAndFile.message, codeAndFile.status });
            }

            ResponseOKModel response = new ResponseOKModel();

            string? name = "";
            int time_limit, mem_limit;

            using var db = new AppDb();

            string strSqlcheck = "xp_checkSolveProblem";
            var p2 = new DynamicParameters();
            p2.Add("@pid", pid);
            p2.Add("@plid", body.plid);
            p2.Add("@contentType", body.file == null ? null : codeAndFile.contentType);
            p2.Add("@fileExtension", body.file == null ? null : codeAndFile.fileExtension);
            p2.Add("@mid", mid);
            p2.Add("@time_limit", dbType: DbType.Int32, direction: ParameterDirection.Output);
            p2.Add("@mem_limit", dbType: DbType.Int32, direction: ParameterDirection.Output);
            p2.Add("@lang", dbType: DbType.String, direction: ParameterDirection.Output, size: 255);
            p2.Add("@status", dbType: DbType.Boolean, direction: ParameterDirection.Output);
            p2.Add("@message", dbType: DbType.String, direction: ParameterDirection.Output, size: 255);
            db.Connection.Execute(strSqlcheck, p2, commandType: CommandType.StoredProcedure);
            response.status = p2.Get<bool>("@status");
            response.message = p2.Get<string>("@message");
            name = p2.Get<string>("@lang");
            time_limit = p2.Get<Int32>("@time_limit");
            mem_limit = p2.Get<Int32>("@mem_limit") * 1024;

            if (!response.status)
            {
                return Ok(response);
            }


            using MultipartFormDataContent formData = new MultipartFormDataContent();

            using MemoryStream memoryStream = new MemoryStream(Encoding.UTF8.GetBytes(codeAndFile.code));
            using StreamContent streamContent = body.file == null ?
                    new StreamContent(memoryStream) :
                        new StreamContent(body.file.OpenReadStream());

            streamContent.Headers.ContentType = new MediaTypeHeaderValue(codeAndFile.contentType);

            formData.Add(streamContent, "source", codeAndFile.filename);
            formData.Add(new StringContent(name), "lang");
            formData.Add(new StringContent(time_limit.ToString()), "time_limit");
            formData.Add(new StringContent(mem_limit.ToString()), "memory_limit");
            formData.Add(new StringContent(pid.ToString()), "pid");

            int statusCode;
            bool success = false;
            var validStatusCodes = new HashSet<int> { 200, 201, 202 };

            JudgeSolveResModel judgeSolveResModel = new FnJudge().PostForm<JudgeSolveResModel>(_httpClient, $"{judgeapi}{judgeapi_solve}", formData, out statusCode);

            if(judgeSolveResModel == null || !validStatusCodes.Contains(statusCode))
            {
                response.message = "Judge錯誤";
                response.status = false;
                return Ok(response);
            }

            if(statusCode == 200)
            {
                judgeSolveResModel.kind = "Accept";
                success = true;
            }

            string strSql = "xp_solveJudgeProblem";
            this.HttpContext.Items.Add("ObjectName", strSql);

            var p = new DynamicParameters();
            p.Add("@pid", pid);
            p.Add("@plid", body.plid);
            p.Add("@code", codeAndFile.code);
            p.Add("@statusCode", statusCode);
            p.Add("@runTime", judgeSolveResModel.runTime);
            p.Add("@memory", judgeSolveResModel.memory);
            p.Add("@kind", judgeSolveResModel.kind);
            p.Add("@errMessage", judgeSolveResModel.message);
            p.Add("@bFile", body.file == null ? false : true);
            p.Add("@mid", mid);
            p.Add("@sid", sid);
            db.Connection.Execute(strSql, p, commandType: CommandType.StoredProcedure);

            this.HttpContext.Items.Add("SP_InOut", p);


            return Ok(new { success, judgeSolveResModel.kind, judgeSolveResModel.runTime, judgeSolveResModel.memory, name });
        }


        #region run功能，使用者自訂測資
        /// <summary>
        /// run功能，使用者自訂測資
        /// </summary>
        /// <param name="pid">Problem.pid</param>
        /// <remarks>
        /// - 需先登入，否則回傳無權限401
        /// - 介接POST /judge/run
        /// - 回傳Judge Api StatusCode 200、201 Response
        /// - 其餘回傳Judge錯誤
        /// </remarks>
        [HttpPost("Run/{pid}")]
        [ProducesResponseType(typeof(RunJudgeResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ResponseModel), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(JudgeErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> runJudge(int pid, [FromForm] runJudge body)
        {
            int mid = (int)this.HttpContext.Items["MID"];
            int sid = (int)this.HttpContext.Items["SID"];
            
            if (mid == 0)
            {
                return new myUnauthorizedResult("登入後解鎖");
            }

            var config = AppConfig.Config;
            int size_limit = new Param().ConvertType<int>(config["JudgeAPI:size_limit"]);
            int size_limit_testcase = new Param().ConvertType<int>(config["JudgeAPI:size_limit_testcase"]);
            string judgeapi_run = config["JudgeAPI:run"];
            string judgeapi = config["JudgeAPI:base_uri"];

            RunJudgeResponse runJudgeResponse = new RunJudgeResponse();
            CodeAndFileModel source = await new FnFile().checkJudgeCodeAndFile(null, body.source, size_limit);

            CodeAndFileModel input = await new FnFile().checkJudgeCodeAndFile(null, body.input, size_limit_testcase);

            if(input.contentType != "text/plain")
            {
                runJudgeResponse.status = false;
                runJudgeResponse.message = "input不允許該檔案類型";
            }

            if (!(source.status && input.status))
            {
                runJudgeResponse.status = false;
                runJudgeResponse.message = source.status ? input.message : source.message;
                return Ok(runJudgeResponse);
            }

            string? lang = "";
            int? time_limit, mem_limit;

            using var db = new AppDb();
            string strSqlcheck = "xp_checkSource";
            var p2 = new DynamicParameters();
            p2.Add("@pid", pid);
            p2.Add("@plid", body.plid);
            p2.Add("@contentType", source.contentType);
            p2.Add("@fileExtension", source.fileExtension);
            p2.Add("@time_limit", dbType: DbType.Int32, direction: ParameterDirection.Output);
            p2.Add("@mem_limit", dbType: DbType.Int32, direction: ParameterDirection.Output);
            p2.Add("@lang", dbType: DbType.String, direction: ParameterDirection.Output, size: 255);
            p2.Add("@status", dbType: DbType.Boolean, direction: ParameterDirection.Output);
            p2.Add("@message", dbType: DbType.String, direction: ParameterDirection.Output, size: 255);
            db.Connection.Execute(strSqlcheck, p2, commandType: CommandType.StoredProcedure);
            runJudgeResponse.status = p2.Get<bool>("@status");
            runJudgeResponse.message = p2.Get<string>("@message");
            lang = p2.Get<string?>("@lang");
            time_limit = p2.Get<Int32?>("@time_limit");
            mem_limit = p2.Get<Int32?>("@mem_limit") * 1024;

            if (!runJudgeResponse.status)
            {
                return Ok(runJudgeResponse);
            }

            using MultipartFormDataContent formData = new MultipartFormDataContent();


            byte[] inputBytes = Encoding.UTF8.GetBytes(source.code);
            using var fileContent1 = new ByteArrayContent(inputBytes);
            formData.Add(fileContent1, "source", body.source.FileName);

            byte[] outputBytes = Encoding.UTF8.GetBytes(input.code);
            using var fileContent2 = new ByteArrayContent(outputBytes);
            formData.Add(fileContent2, "input", body.input.FileName);
            
            formData.Add(new StringContent(lang), "lang");
            formData.Add(new StringContent(time_limit.ToString()), "time_limit");
            formData.Add(new StringContent(mem_limit.ToString()), "memory_limit");
            formData.Add(new StringContent(pid.ToString()), "pid");

            int statusCode;
            bool success = false;
            var validStatusCodes = new HashSet<int> { 200, 201, 202 };

            runJudgeResponse = new FnJudge().PostForm<RunJudgeResponse>(_httpClient, $"{judgeapi}{judgeapi_run}", formData, out statusCode);

            if (runJudgeResponse == null || !validStatusCodes.Contains(statusCode))
            {
                return new InternalServerError("Judge錯誤");
            }
            else if(statusCode == 200)
            {
                runJudgeResponse.status = true;
            }
            

            return Ok(runJudgeResponse);
        }
        #endregion


        /// <summary>
        /// 上傳範例程式碼，cid為題目範例程式目錄，plid為程式語言，回傳status、message
        /// </summary>
        [HttpPut("Solution/{pid}")]
        [AuthFilter("U")]
        public async Task<IActionResult> uploadSolution(int pid, [FromForm] uploadSolution body)
        {
            int mid = (int)this.HttpContext.Items["MID"];
            int sid = (int)this.HttpContext.Items["SID"];

            var config = AppConfig.Config;
            int size_limit = new Param().ConvertType<int>(config["JudgeAPI:size_limit"]);
            string judgeapi = config["JudgeAPI:base_uri"];
            string judgeapi_solution = config["JudgeAPI:solution"];

            CodeAndFileModel codeAndFile = await new FnFile().checkJudgeCodeAndFile(body.code, body.file, size_limit);

            if (!codeAndFile.status)
            {
                return Ok(new { codeAndFile.message, codeAndFile.status });
            }

            ResponseOKModel response = new ResponseOKModel();
            string? lang = "";

            using var db = new AppDb();

            string cheksql = "xp_checkSolution";
            var p1 = new DynamicParameters();
            p1.Add("@cid", body.cid);
            p1.Add("@plid", body.plid);
            p1.Add("@pid", pid);
            p1.Add("@contentType", body.file == null ? null : codeAndFile.contentType);
            p1.Add("@fileExtension", body.file == null ? null : codeAndFile.fileExtension);
            p1.Add("@lang", dbType: DbType.String, direction: ParameterDirection.Output, size: 255);
            p1.Add("@status", dbType: DbType.Boolean, direction: ParameterDirection.Output);
            p1.Add("@message", dbType: DbType.String, direction: ParameterDirection.Output, size: 255);
            db.Connection.Execute(cheksql, p1, commandType: CommandType.StoredProcedure);
            response.status = p1.Get<bool>("@status");
            response.message = p1.Get<string>("@message");
            lang = p1.Get<string>("@lang");

            if (!response.status)
            {
                return Ok(response);
            }

            using MultipartFormDataContent formData = new MultipartFormDataContent();

            using MemoryStream memoryStream = new MemoryStream(Encoding.UTF8.GetBytes(codeAndFile.code));
            using StreamContent streamContent = body.file == null ?
                    new StreamContent(memoryStream) :
                        new StreamContent(body.file.OpenReadStream());

            streamContent.Headers.ContentType = new MediaTypeHeaderValue(codeAndFile.contentType);

            formData.Add(streamContent, "source", codeAndFile.filename);
            formData.Add(new StringContent(pid.ToString()), "pid");
            formData.Add(new StringContent(lang), "lang");


            int statusCode;

            ResponseOKModel judgeRes = new FnJudge().PutForm<ResponseOKModel>(_httpClient, $"{judgeapi}{judgeapi_solution}", formData, out statusCode);

            if(judgeRes == null || statusCode != 200)
            {
                response.status = false;
                response.message = "Judge失敗";
                return Ok(response);
            }

            if (judgeRes.status)
            {
                string strSql = "xp_insertSolution";
                this.HttpContext.Items.Add("ObjectName", strSql);

                var p = new DynamicParameters();
                p.Add("@cid", body.cid);
                p.Add("@plid", body.plid);
                p.Add("@code", codeAndFile.code);
                p.Add("@mid", mid);
                p.Add("@sid", sid);
                db.Connection.Execute(strSql, p, commandType: CommandType.StoredProcedure);

                this.HttpContext.Items.Add("SP_InOut", p);
            }


            return Ok(judgeRes);
        }

        #region Solution Run功能
        /// <summary>
        /// Solution Run功能
        /// </summary>
        /// <param name="pid">Problem.pid</param>
        /// <remarks>
        /// - 需先登入，否則回傳無權限401
        /// - 介接POST /problem/solution/run
        /// </remarks>
        [HttpPost("Solution/Run/{pid}")]
        [ProducesResponseType(typeof(ResponseOKModel), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ResponseModel), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(JudgeErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> runSolution(int pid, [FromForm] SolutionRun body)
        {
            int mid = (int)this.HttpContext.Items["MID"];
            int sid = (int)this.HttpContext.Items["SID"];

            if (mid == 0)
            {
                return new myUnauthorizedResult("登入後解鎖");
            }

            var config = AppConfig.Config;
            int size_limit_testcase = new Param().ConvertType<int>(config["JudgeAPI:size_limit_testcase"]);
            string judgeapi_run = config["JudgeAPI:solutionRun"];
            string judgeapi = config["JudgeAPI:base_uri"];

            ResponseOKModel response = new ResponseOKModel();

            CodeAndFileModel input = await new FnFile().checkJudgeCodeAndFile(null, body.input, size_limit_testcase);


            if (!input.status || input.contentType != "text/plain")
            {
                response.message = input.status ? "input不允許該檔案類型" :  input.message;
                return Ok(response);
            }


            string strsql = @"select 1 bExists from vd_ProblemAll_Pub where pid = @pid";

            using (var db = new AppDb())
            {

                var data = db.Connection.QueryFirstOrDefault(strsql, new { pid });

                if (data == null) 
                {
                    response.message = "id不符";
                    return Ok(response);
                }
            }


            using MultipartFormDataContent formData = new MultipartFormDataContent();

            byte[] outputBytes = Encoding.UTF8.GetBytes(input.code);
            using var fileContent2 = new ByteArrayContent(outputBytes);
            formData.Add(fileContent2, "input", body.input.FileName);

            formData.Add(new StringContent(pid.ToString()), "pid");

            int statusCode;
            bool success = false;

            response = new FnJudge().PostForm<ResponseOKModel>(_httpClient, $"{judgeapi}{judgeapi_run}", formData, out statusCode);

            if (response == null || statusCode == 500)
            {
                return new InternalServerError("Judge錯誤");
            }

            return Ok(response);
        }
        #endregion


        /// <summary>
        /// 上傳測資，必須有input、回傳status、message
        /// </summary>
        [HttpPost("TestCase/{pid}")]
        [AuthFilter("I")]
        public async Task<IActionResult> uploadTestCase(int pid, [FromForm] UploadTestCaseModel body)
        {
            int mid = (int)this.HttpContext.Items["MID"];
            int sid = (int)this.HttpContext.Items["SID"];

            var config = AppConfig.Config;
            int size_limit = new Param().ConvertType<int>(config["JudgeAPI:size_limit_testcase"]);
            string judgeapi_testcase = config["JudgeAPI:testcase"];
            string judgeapi = config["JudgeAPI:base_uri"];

            FnFile fn = new FnFile();

            CodeAndFileModel codeAndFileInput = await fn.checkJudgeCodeAndFile(body.input, body.inputFile, size_limit);
            if (!codeAndFileInput.status)
                return Ok(new { codeAndFileInput.status, codeAndFileInput.message });


            CodeAndFileModel codeAndFileOutput = await fn.checkJudgeCodeAndFile(body.output, body.outputFile, size_limit);
            if (body.outputFile != null && !codeAndFileOutput.status)
            {
                return Ok(new { codeAndFileOutput.status, codeAndFileOutput.message });
            }

            ResponseOKModel response = new ResponseOKModel();

            if (codeAndFileInput.contentType != "text/plain" || codeAndFileOutput.contentType !=  "text/plain")
            {
                response.message = "不允許檔案類型";
                return Ok(response);
            }

            using var db = new AppDb();

            string strSqlcheck = "[xp_checkTestCase]";
            var p2 = new DynamicParameters();
            p2.Add("@cid", body.cid);
            p2.Add("@pid", pid);
            p2.Add("@tcid", null);
            p2.Add("@datatype", 0);
            p2.Add("@status", dbType: DbType.Boolean, direction: ParameterDirection.Output);
            p2.Add("@message", dbType: DbType.String, direction: ParameterDirection.Output, size: 255);
            db.Connection.Execute(strSqlcheck, p2, commandType: CommandType.StoredProcedure);
            response.status = p2.Get<bool>("@status");
            response.message = p2.Get<string>("@message");

            if (!response.status)
            {
                return Ok(response);
            }

            using MultipartFormDataContent formData = new MultipartFormDataContent();

            byte[] inputBytes = Encoding.UTF8.GetBytes(codeAndFileInput.code);
            using var fileContent1 = new ByteArrayContent(inputBytes);
            formData.Add(fileContent1, "input", "input.txt");

            ByteArrayContent fileContent2 = null;
            if (codeAndFileOutput.code != null)
            {
                byte[] outputBytes = Encoding.UTF8.GetBytes(codeAndFileOutput.code);
                fileContent2 = new ByteArrayContent(outputBytes);
                formData.Add(fileContent2, "output", "output.txt");
            }

            formData.Add(new StringContent(pid.ToString()), "pid");

            int statusCode;
            var validStatusCodes = new HashSet<int> { 200, 201 };
            JudgeTestCaseResModel judgeTestCaseRes = new FnJudge().PostForm<JudgeTestCaseResModel>(_httpClient, $"{judgeapi}{judgeapi_testcase}", formData, out statusCode);

            fileContent2?.Dispose();

            if (judgeTestCaseRes == null || !validStatusCodes.Contains(statusCode))
            {
                response.status = false;
                response.message = "Judg錯誤";
                return Ok(response);
            }


            if (judgeTestCaseRes.status ?? false)
            {
                judgeTestCaseRes.message = judgeTestCaseRes.message ?? "上傳成功";
                string strSql = "xp_insertTestCase";
                this.HttpContext.Items.Add("ObjectName", strSql);

                var p = new DynamicParameters();
                p.Add("@cid", body.cid);
                p.Add("@pid", pid);
                p.Add("@tid", judgeTestCaseRes.tid);
                p.Add("@input", codeAndFileInput.code);
                p.Add("@output", judgeTestCaseRes.output);
                p.Add("@in_md5", judgeTestCaseRes.in_md5);
                p.Add("@out_md5", judgeTestCaseRes.out_md5);
                p.Add("@mid", mid);
                p.Add("@sid", sid);
                db.Connection.Execute(strSql, p, commandType: CommandType.StoredProcedure);

                this.HttpContext.Items.Add("SP_InOut", p);

            }

            return Ok(new { judgeTestCaseRes.status, judgeTestCaseRes.message });
        }

        /// <summary>
        /// 刪除測資
        /// </summary>
        [HttpDelete("TestCase/{pid}")]
        [AuthFilter("D")]
        public async Task<IActionResult> delTestCase(int pid, [FromBody] DeleteTestCaseModel body)
        {
            int mid = (int)this.HttpContext.Items["MID"];
            int sid = (int)this.HttpContext.Items["SID"];

            var config = AppConfig.Config;
            string judgeapi_testcase = config["JudgeAPI:testcase"];
            string judgeapi = config["JudgeAPI:base_uri"];

            FnFile fn = new FnFile();
            ResponseOKModel response = new ResponseOKModel();

            using var db = new AppDb();

            string strSqlcheck = "[xp_checkTestCase]";
            var p2 = new DynamicParameters();
            p2.Add("@cid", body.cid);
            p2.Add("@pid", pid);
            p2.Add("@tcid", body.tcid);
            p2.Add("@datatype", 1);
            p2.Add("@status", dbType: DbType.Boolean, direction: ParameterDirection.Output);
            p2.Add("@message", dbType: DbType.String, direction: ParameterDirection.Output, size: 255);
            db.Connection.Execute(strSqlcheck, p2, commandType: CommandType.StoredProcedure);
            response.status = p2.Get<bool>("@status");
            response.message = p2.Get<string>("@message");

            if (!response.status)
            {
                return Ok(response);
            }

            int statusCode;
           
            ResponseOKModel judgeTestCaseRes = new FnJudge().Delete<ResponseOKModel>(_httpClient, $"{judgeapi}{judgeapi_testcase}?tid={body.tcid}", out statusCode);

            if (judgeTestCaseRes == null || statusCode != 200)
            {
                response.status = false;
                response.message = "Judg錯誤";
                return Ok(response);
            }


            if (judgeTestCaseRes.status)
            {
                judgeTestCaseRes.message = judgeTestCaseRes.message.IsNullOrEmpty() ? "刪除成功" : judgeTestCaseRes.message;
                string strSql = "xp_deleteTestCase";
                this.HttpContext.Items.Add("ObjectName", strSql);

                var p = new DynamicParameters();
                p.Add("@cid", body.cid);
                p.Add("@pid", pid);
                p.Add("@tcid", body.tcid);
                p.Add("@mid", mid);
                p.Add("@sid", sid);
                db.Connection.Execute(strSql, p, commandType: CommandType.StoredProcedure);

                this.HttpContext.Items.Add("SP_InOut", p);

            }

            return Ok(new { judgeTestCaseRes.status, judgeTestCaseRes.message });
        }

        private async Task<IActionResult> ProcessFile(FnFile fnFile, IFormFile fileSource, int sizeLimit)
        {
            CodeAndFileModel result = await fnFile.checkJudgeCodeAndFile(null, fileSource, sizeLimit);

            if (!result.status)
            {
                return Ok(new { result.message, result.status });
            }

            return null; // 代表成功，呼叫者需要處理這種情況
        }
    }

    
}
