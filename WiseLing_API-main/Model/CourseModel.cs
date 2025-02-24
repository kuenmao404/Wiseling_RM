using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace WiseLing_API.Model
{
    public class CreateCourse
    {
        public List<IFormFile>? files { get; set; }

        [DisplayName("課程名稱")]
        [StringLength(230, ErrorMessage = "長度不能超過{1}")]
        public string? courseName { get; set; }

        [DisplayName("課程描述")]
        [StringLength(3950, ErrorMessage = "長度不能超過{1}")]
        public string? courseDes { get; set; }
        public string? tags { get; set; }
        public int courseStatus { get; set; }
        public int joinStatus { get; set; }
    }

    public class UpdateCourse
    {
        public List<IFormFile>? files { get; set; }

        [DisplayName("課程名稱")]
        [StringLength(230, ErrorMessage = "長度不能超過{1}")]
        public string? courseName { get; set; }

        [DisplayName("課程描述")]
        [StringLength(3950, ErrorMessage = "長度不能超過{1}")]
        public string? courseDes { get; set; }
        public string? tags { get; set; }
        public int? courseStatus { get; set; }
        public int? joinStatus { get; set; }
        public int ownerMID { get; set; }
    }

    public class DeleteCourse
    {

        [DisplayName("課程名稱")]
        [StringLength(230, ErrorMessage = "長度不能超過{1}")]
        public string? courseName { get; set; }
        public int ownerMID { get; set; }

    }

    public class InsertVideoToChapter
    {
        public int courseCID { get; set; }
        public int type { get; set; }
        public int? oid { get; set; }
        public bool bYoutube { get; set; }
        public bool bPlayList { get; set; }
        public string? url { get; set; }

        public InsertVideoToChapter()
        {
            bYoutube = false;
            bPlayList = false;
        }
    }
}
