namespace WiseLing_API.Model
{
    public class Note2File
    {
        public string md { get; set; }
        public int id { get; set; }
    }
    

    public class NoteFileDownload
    {
        public byte[] content { get; set; }
        public string filename { get; set; }
    }

}

