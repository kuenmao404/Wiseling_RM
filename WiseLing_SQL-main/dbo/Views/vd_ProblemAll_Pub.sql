
CREATE view vd_ProblemAll_Pub as
with t as(
	select distinct(pid) as pid from vd_ClassProblemTestCase
)
select P.pid, p.ClassID as cid, O.CName 'title', p.difficulty, 
	p.statement, p.in_spec, p.out_spec, p.sample_tests, p.hints, p.time_limit, p.mem_limit,
	(
		select a.cid, a.cname, a.ename, a.keywords 
		from OC, vd_AlgorithmTag a
		where P.pid = oc.OID and oc.CID = a.CID
		order by rank
		for json auto, include_null_values
	) 'tags',
	(
		select v.plid, v.name, [key]
		from vd_ProblemLang v where p.PID = v.pid
		for json auto
	) 'lang',
	cast(iif(t.pid is null, 0, 1) as bit) as bTestCase
from Object O, Problem P
left join t
on p.pid = t.pid
where o.bDel = 0 and O.OID = P.PID and o.bHided = 0
GO
GRANT SELECT
    ON OBJECT::[dbo].[vd_ProblemAll_Pub] TO [WiseLingPublic]
    AS [dbo];

