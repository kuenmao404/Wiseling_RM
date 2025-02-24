CREATE view vd_CourseProblemMSolution as
select v.courseCID, v.cid, c.mid as ownerMID, 
c.pid, s.sid as solutionID, s.Text as code, j.bAccept, j.runTime, j.memory, jk.kind,
p.plid, p.name as language, p.[key], convert(varchar, j.Since, 120) as since
from vd_CourseNext v, CourseProblemMStatus c, JudgeSolve j, Solution s, vd_PLanguage_Pub p, JudgeKind jk
where v.cid = c.CID and c.JSID = j.JSID and j.sid = s.sid and j.PLID = p.plid and j.JKID = jk.JKID