
CREATE view vd_JudgeSolveSolution as
select j.jsid, j.pid, j.sid, j.ownerMID as mid, j.plid, v.name, j.runTime, j.memory, j.bAccept, 
	k.jkid, k.kind, k.type, convert(varchar, j.since, 120) as since,
	s.Text as code
from JudgeSolve j, JudgeKind k, vd_PLanguage_Pub v, Solution s
where j.JKID = k.JKID and j.bDel = 0 and j.PLID = v.plid and j.sid = s.SID