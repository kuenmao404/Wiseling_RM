


CREATE view vd_ProblemTag_Pub as
select v.pid, v.classID as cid, v.title, v.difficulty, v.keywords + v.title 'searchstr', 
	(
		select a.cid, a.cname, a.ename, a.keywords 
		from OC, vd_AlgorithmTag a
		where v.pid = oc.OID and oc.CID = a.CID
		order by rank
		for json auto, include_null_values
	) 'tag'
from vd_Problem v
GO
GRANT SELECT
    ON OBJECT::[dbo].[vd_ProblemTag_Pub] TO [WiseLingPublic]
    AS [dbo];

