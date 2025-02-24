using System.ComponentModel.DataAnnotations;
using System.ComponentModel;

namespace WiseLing_API.Model
{
    public class IviteCourseModel
    {
        public int courseCID { get; set; }
        public int cid { get; set; }

        [DisplayName("信箱")]
        [EmailAddress(ErrorMessage = "格式錯誤")]
        public string email { get; set; }
    }

    public class IviteOutputModel
    {
        public int? iid { get; set; }
        public string? courseName { get; set; }
        public string? gname { get; set; }
        public Guid? token { get; set; }
        public string? expired { get; set; }
    }

    public class ResentInviteCourseModel
    {
        public int courseCID { get; set; }
        public int cid { get; set; }

        [DisplayName("信箱")]
        [EmailAddress(ErrorMessage = "格式錯誤")]
        public string email { get; set; }
        public int iid { get; set; }
    }
    public class DeleteInviteCourseModel
    {
        public int iid { get; set; }
        public int courseCID { get; set; }
        public int cid { get; set; }
    }
}
