CREATE view Anl.vd_CourseChapter as
select courseCID, courseName, cid as chapterCID, chapterName, chapterDes, nO, hide, rank
from dbo.vd_CourseChapter