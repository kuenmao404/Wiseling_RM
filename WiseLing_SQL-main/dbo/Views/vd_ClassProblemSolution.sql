CREATE view vd_ClassProblemSolution as
with t as(
	select ROW_NUMBER() over (PARTITION by cs.CID order by cs.Since desc) 'Row',
		cs.cid, 
		s.sid, s.text, p.plid, P.name, P.[key], 
		m.mid as ownerMID, m.name as owner, m.sso,
		convert(varchar, cs.Since, 120) as since
	from CSolution cs, Solution s, vd_PLanguage_Pub p, vs_Member m
	where cs.SID = s.sid and cs.PLID = p.plid and cs.OwnerMID = m.MID
)
select c.pid, c.cid, t.sid, t.text, t.plid, t.name, t.[key], t.since, t.ownerMID, t.owner, t.SSO
from vd_ClassProblem c, t
where c.type = 31 and t.Row = 1 and t.CID = c.cid