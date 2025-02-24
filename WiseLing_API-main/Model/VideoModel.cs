namespace WiseLing_API.Model
{
    public class InsertVideoToParagraph
    {
        public int paragraphCID { get; set; }
        public int? vid { get; set; }
        public bool bYoutube { get; set; }
        public bool bPlayList { get; set; }
        public string? url { get; set; }

        public InsertVideoToParagraph()
        {
            bYoutube = false;
            bPlayList = false;
        }
    }

    public class InsVListVideo
    {
        public string? idstr { get; set; }
        public string? mode { get; set; }
        public bool bYoutube { get; set; }
        public bool bPlayList { get; set; }
        public string? url { get; set; }

        public InsVListVideo()
        {
            bYoutube = false;
            bPlayList = false;
        }
    }

    public class YoutubeAPIModel
    {
        public bool bPlayList { get; set; }
        public string? url { get; set; }

        public YoutubeAPIModel()
        {
            bPlayList = false;
        }
    }

    public class SingleV_YTAPI
    {
        public string message { get; set; }
        public bool status { get; set; }
        public int? vid { get; set; }

        public SingleV_YTAPI(string message2 = "錯誤", bool status2 = false)
        {
            message = message2;
            status = status2;
        }
    }

    public class Response_YTAPI
    {
        public string message { get; set; }
        public bool status { get; set; }
        public int? vid { get; set; }
        public string vid_str { get; set; }

        public Response_YTAPI(string message2 = "錯誤", bool status2 = false)
        {
            message = message2;
            status = status2;
        }
    }
}
