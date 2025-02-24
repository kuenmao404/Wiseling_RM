CREATE view vd_JudgeSolve as
select j.jsid, j.pid, p.title, p.difficulty, p.tags, j.ownerMID as mid, j.plid, v.name, j.runTime, j.memory, j.bAccept, 
	k.jkid, k.kind, k.type, convert(varchar, j.since, 120) as since ,
	s.sid, s.Text as code
from JudgeSolve j, JudgeKind k, vd_PLanguage_Pub v, Solution s, vd_ProblemAll_Pub p
where j.JKID = k.JKID and j.bDel = 0 and j.PLID = v.plid and j.sid = s.SID and j.PID = p.pid