namespace WiseLing_API.Model
{
    public class LogOpenModel
    {
        public int? mid { get; set; }
        public int? sid { get; set; }
        public LogRequestModel request { get; set; } = new LogRequestModel();
        public LogResponseModel response { get; set; } = new LogResponseModel();
        public int? sessionDuration { get; set; }
        public int? filterActionDuration { get; set; }
        public int? duration { get; set; }
        public string log_type { get; set; } = "api_logs";
    }

    public class LogRequestModel
    {
        public string ip { get; set; }
        public string method { get; set; }
        public string requestURI { get; set; }
        public string path { get; set; }
        public string queryString { get; set; }
        public string? routeTemplate { get; set; }
        public string requestHeader { get; set; }
        public bool bForm { get; set; } = false;
        public string? requestBody { get; set; }
        public DateTime? requestTime { get; set; }
        public DateTime filterActionTime { get; set; }
    }

    public class LogResponseModel
    {
        public int statusCode { get; set; }
        public string contentType { get; set; }
        public string responseBody { get; set; }
        public DateTime responseTime { get; set; }
    }

    public class LogModel
    {
        public string Method { get; set; }
        public string Path { get; set; }
        public string QueryString { get; set; }
        public string Headers { get; set; }
        public string Scheme { get; set; }
        public string Host { get; set; }
        public bool bForm { get; set; } = false;
        public DateTime RequestTime { get; set; }
        public int StatusCode { get; set; }
        public string ContentType { get; set; }
        public string ResponseHeaders { get; set; }
        public DateTime ResponseTime { get; set; }
        public int Duration { get; set; }
    }


}

