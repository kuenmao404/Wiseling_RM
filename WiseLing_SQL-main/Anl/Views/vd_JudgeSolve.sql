CREATE view Anl.vd_JudgeSolve as
select j.jsid, j.pid, j.ownerMID, j.bAccept, j.runTime 'runTime (ms)', j.memory 'memory (KB)', k.kind, j.errMessage, j.since, j.bFile, p.name as langauge, s.sid, s.Text as solution
from dbo.JudgeSolve j, dbo.vd_PLanguage_Pub p, dbo.Solution s, dbo.JudgeKind k
where j.SID = s.SID and j.PLID = p.plid and j.JKID = k.JKID