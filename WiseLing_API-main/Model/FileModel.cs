namespace WiseLing_API.Model
{
    public class FileModel
    {
        public int? cid { get; set; }
        public List<IFormFile> files { get; set; }
        public bool bMD { get; set; }
        public FileModel()
        {
            bMD = false;
        }
    }

    public class uploadFileModel
    {
        public int oid { get; set; }
        public Guid? uuid { get; set; }
        public bool status { get; set; }
        public string message { get; set; }

        public uploadFileModel()
        {
            oid = -1;
            status = false;
            uuid = null;
            message = "上傳失敗";
        }
    }
}
