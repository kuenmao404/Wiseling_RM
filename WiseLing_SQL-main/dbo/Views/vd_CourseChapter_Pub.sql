create view vd_CourseChapter_Pub as
select [courseCID], [courseName], [courseStatus], [cid], [chapterName], [chapterDes], [hide], [rank]
from vd_CourseChapter
where courseStatus = 0 and hide = 0
GO
GRANT SELECT
    ON OBJECT::[dbo].[vd_CourseChapter_Pub] TO [WiseLingPublic]
    AS [dbo];

