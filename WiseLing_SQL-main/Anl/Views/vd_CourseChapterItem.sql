CREATE view Anl.vd_CourseChapterItem as
select courseCID, cid as chapterCID, oid, typeName, type, title, videoID, difficulty, tag, rank, nAccept 
from dbo.vd_CourseChapterItem