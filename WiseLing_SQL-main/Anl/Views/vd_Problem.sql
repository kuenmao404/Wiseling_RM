
CREATE view Anl.vd_Problem as
with t as(
	select distinct(pid) as pid from dbo.vd_ClassProblemTestCase
)
select P.pid, O.CName 'title', p.difficulty, 
	p.statement, p.in_spec, p.out_spec, p.sample_tests, p.hints, p.time_limit, p.mem_limit, p.nSubmit,
	(
		select a.cid, a.cname, a.ename, a.keywords 
		from OC, vd_AlgorithmTag a
		where P.pid = oc.OID and oc.CID = a.CID
		order by Rank
		for json auto, include_null_values
	) 'tags',
	cast(iif(t.pid is null, 0, 1) as bit) as bTestCase, 
	v.text as solution, o.bHided
from dbo.Object O, dbo.Problem P
left join t
on p.pid = t.pid
left join dbo.vd_ClassProblemSolution v
on p.PID = v.pid
where O.OID = P.PID and o.bDel = 0