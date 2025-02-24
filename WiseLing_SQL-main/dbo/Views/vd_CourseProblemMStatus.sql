CREATE view vd_CourseProblemMStatus as
select v.courseCID, v.cid, c.pid, c.bAccept, c.nSubmit, c.nFirstAccSubmit,
	convert(varchar, c.acceptSince, 120) as acceptSince, 
	convert(varchar, c.since, 120) as since, 
	convert(varchar, c.LastModifiedDT, 120) as lastModifiedDT,
	j.sid as solutionID,
	m.mid as ownerMID, m.name, m.sso, m.img
from vd_CourseNext v, CourseProblemMStatus c, JudgeSolve j, vs_Member m
where v.cid = c.CID and c.JSID = j.JSID and c.MID = m.mid