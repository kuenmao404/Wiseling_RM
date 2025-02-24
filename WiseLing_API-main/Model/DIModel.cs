

namespace WiseLing_API.Model
{
    public class DIModel
    {
        public int? MID { get; set; }
        public int? SID { get; set; }
        public string IP { get; set; }
        public DateTime RequestTime { get; set; }
        public bool EnableRequestLogging { get; set; }  = true;
        public bool EnableRequestBodyLogging { get; set; } = true;
        public bool EnableResponseLogging { get; set; } = true;
        public bool EnableResponseBodyLogging { get; set; } = true;
        public string? RequestBody { get; set; }
    }

    public class UUIDModel
    {
        public int? CID { get; set; }
        public bool MIDMode { get; set; }
        public string ObjectName { get; set; }
        public dynamic? RequestBodyJson { get; set; }
        public dynamic UUID_data { get; set; }
        public PermissionModel PermissionModel { get; set; }
        public int PermissionPos { get; set; }
        public bool bPermission { get; set; }
        public bool TxType { get; set; }
    }
}
