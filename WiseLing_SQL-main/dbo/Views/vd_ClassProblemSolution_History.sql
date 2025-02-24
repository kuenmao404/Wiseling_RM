CREATE view vd_ClassProblemSolution_History as
select c.pid, c.cid, convert(varchar, cs.Since, 120) as since, s.SID, s.text, p.plid, P.name, P.[key], 
		m.mid as ownerMID, m.name as owner, m.sso
from vd_ClassProblem c, CSolution cs, Solution s, vd_PLanguage_Pub p, vs_Member m
where c.type = 31 and c.cid = cs.CID and cs.SID = s.sid
and cs.PLID = p.plid and cs.OwnerMID = m.MID