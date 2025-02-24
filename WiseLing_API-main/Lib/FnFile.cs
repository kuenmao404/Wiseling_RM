using Dapper;
using Microsoft.IdentityModel.Tokens;
using System.Data;
using System.Dynamic;
using System.Text;
using System.Text.RegularExpressions;
using WiseLing_API.Model;

namespace WiseLing_API.Lib
{
    public class FnFile
    {
        public string getFilePath(bool bPublic)
        {
            var config = AppConfig.Config;
            string filePath;

            if (bPublic)
            {
                filePath =  config["File:StoredFilesPath"];
            }
            else{
                 filePath =  config["File:StoredFilesPathPrivate"];
            }
            return filePath;
        }

        static string FileSize(long fileSizeInBytes)
        {
            string[] sizes = { "B", "KB", "MB", "GB", "TB" };
            int order = 0;

            while (fileSizeInBytes >= 1024 && order < sizes.Length - 1)
            {
                order++;
                fileSizeInBytes /= 1024;
            }

            return $"{fileSizeInBytes}{sizes[order]}";
        }

        public bool FileSizeLimitKB(IFormFile file, int KB)
        {
            if(file.Length > KB * 1024)
                return false;
            return true;
        }

        public ResponseOKModel checkFile(IFormFile file, int mode, int KB)
        {
            ResponseOKModel response = new ResponseOKModel("檔案格式正確", true);

            if (file is null)
            {
                response.message = "無檔案上傳";
                response.status = false;
                return response;
            }

            var config = AppConfig.Config;

            string[] filetype = config["AllowFilesType:Files"].Split(",");
            string[] imgtype = config["AllowFilesType:IMG"].Split(",");
            string contentType = file.ContentType;

            if (!FileSizeLimitKB(file, KB))
            {
                response.message = $"超過容量限制{FileSize(KB * 1024)}";
                response.status = false;
                return response;
            }

            int fileindex = Array.FindIndex(filetype, d => d == contentType);
            int imgindex = Array.FindIndex(imgtype, d => d == contentType);

            switch (mode)
            {
                case -1:
                    break;
                case 0: //照片only

                    if (imgindex < 0)
                    {
                        response.status = false;
                        response.message = "只允許上傳照片";
                    }
                    break;
                default:
                    if (imgindex < 0 && fileindex < 0)
                    {
                        response.status = false;
                        response.message = "不允許檔案類型";
                    }
                    break;
            }


            return response;
        }

        public async Task<uploadFileModel> uploadFile(AppDb db, IFormFile file, int? cid, int mid, int sid, bool bDel, Guid? uuid = null)
        {
            var config = AppConfig.Config;
            string filePath = getFilePath(cid == null);

            uploadFileModel response = new uploadFileModel();

            try
            {
                #region 新增DB檔案資料
                string strSql = "[xp_insertArchive]";
                var p = new DynamicParameters();
                p.Add("@CID", cid);
                p.Add("@MID", mid);
                p.Add("@FileName", Path.GetFileName(file.FileName));
                p.Add("@FileExtension", Path.GetExtension(file.FileName));
                p.Add("@ContentLen", file.Length);
                p.Add("@ContentType", file.ContentType);
                p.Add("@uuid", uuid);
                p.Add("@bDel", bDel);
                p.Add("@sid", sid);
                p.Add("@NewOID", dbType: DbType.Int32, direction: ParameterDirection.Output);
                p.Add("@outuuid", dbType: DbType.Guid, direction: ParameterDirection.Output, size: 250);
                p.Add("@status", dbType: DbType.Boolean, direction: ParameterDirection.Output);
                p.Add("@message", dbType: DbType.String, direction: ParameterDirection.Output, size: 100);
                db.Connection.Execute(strSql, p, commandType: CommandType.StoredProcedure);
                response.oid = p.Get<int>("@NewOID");
                response.uuid = p.Get<Guid>("outuuid");
                response.status = p.Get<bool>("status");
                response.message = p.Get<string>("@message");
                #endregion

                if (response.status)
                {
                    #region 存放檔案
                    string HexStr = Convert.ToString(Convert.ToInt32(response.oid), 16).PadLeft(8, '0');
                    string fileSubPath = string.Join("\\", Regex.Split(HexStr, "(?<=\\G.{2})(?!$)"));
                    //string SaveFilePath = Path.Combine(filePath, fileSubPath + Path.GetExtension(file.FileName));
                    string SaveFilePath = Path.Combine(filePath, fileSubPath);
                    FileInfo fileInfo = new FileInfo(SaveFilePath);
                    if (fileInfo.Directory.Exists == false)
                        fileInfo.Directory.Create();

                    using (var stream = System.IO.File.Create(SaveFilePath))
                    {
                        await file.CopyToAsync(stream);
                    }
                    #endregion
                }

                new UUID().insertLogManTx("POST", "xp_insertArchive", p, sid, db);

                return response;
            }
            catch
            {
                return response;
            }
        }

        public async Task<uploadFileModel> checkAndUploadFile(int? cid, AppDb db, IFormFile file, int mid, int mode, int sid, bool bDel, Guid? uuid = null, int KB = 1024)
        {

            ResponseOKModel checkFileResponse = checkFile(file, mode, KB);

            uploadFileModel response = new uploadFileModel();

            if (!checkFileResponse.status)
            {
                response.message = checkFileResponse.message;
                return response;
            }

            response = await uploadFile(db, file, cid, mid, sid, bDel, uuid);

            return response;
        }

        public async Task<uploadFileModel> PostSinglefile(FileModel fileModel, int mid, int mode, int sid, bool bDel, Guid? uuid = null, int KB = 1024)
        {
            uploadFileModel response = new uploadFileModel();

            if (fileModel.files != null && fileModel.files.Count > 0)
            {
                using (var db = new AppDb())
                {
                    response = await checkAndUploadFile(fileModel.cid, db, fileModel.files[0], mid, mode, sid, bDel, uuid, KB);
                }
            }
            else
            {
                response.status = true;
                response.message = "無檔案上傳";
            }
            return response;
        }


        public async Task<CodeAndFileModel> checkJudgeCodeAndFile(string? code, IFormFile? file, int size_limit)
        {
            CodeAndFileModel codeAndFile = new CodeAndFileModel();

            if (file != null)
            {
                codeAndFile.contentType = file.ContentType;
                codeAndFile.filename = file.FileName;
                codeAndFile.fileExtension = Path.GetExtension(file.FileName);
                ResponseOKModel response = checkFile(file, -1, size_limit);

                if (!response.status)
                {
                    codeAndFile.message = response.message;
                }
                else
                {
                    try
                    {
                        using (var reader = new StreamReader(file.OpenReadStream(), Encoding.UTF8))
                        {
                            codeAndFile.code = await reader.ReadToEndAsync();
                        }
                        file.OpenReadStream().Seek(0, SeekOrigin.Begin);
                        codeAndFile.status = true;
                    }
                    catch (Exception ex)
                    {
                        codeAndFile.message = "Error reading file.";
                    }
                }
            }
            else if(code.IsNullOrEmpty())
            {
                codeAndFile.message = "不允許提交空程式碼";
            }
            else
            {
                int byteCount = Encoding.UTF8.GetByteCount(code);
                codeAndFile.code = code;

                if (size_limit * 1024 >= byteCount) codeAndFile.status = true;
                else codeAndFile.message = "程式碼長度過長";
            }

            return codeAndFile;
        }


        public async Task<byte[]> getFileBytesAsync(IFormFile file)
        {
            using (var memoryStream = new MemoryStream())
            {
                await file.CopyToAsync(memoryStream);
                return memoryStream.ToArray();
            }
        }

    }
}
