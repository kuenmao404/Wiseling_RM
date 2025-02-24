CREATE view Anl.vd_CourseProblemMStatus as
select n.courseCID, c.pid, mid, bAccept, nSubmit, nFirstAccSubmit, since, lastModifiedDT, acceptSince
from dbo.vd_CourseNext n, dbo.CourseProblemMStatus c
where n.cid = c.CID