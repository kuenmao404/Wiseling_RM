CREATE view vd_CourseChapter as
select v.courseCID, v.courseName, v.courseStatus, c.cid, c.CName 'chapterName', c.CDes 'chapterDes', c.nObject 'nO', c.bHided 'hide', i.rank 
from vd_CourseNext v, Inheritance I, Class c
where v.cname = '章節' and v.Type = 9 and v.cid = i.PCID and i.CCID = c.CID and c.Type = 9
and c.bDel = 0