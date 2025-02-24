CREATE view vd_JudgeRootNextPivot_Pub as
with t as(
	select pcid, pname, CID, EName
	from vd_JudgeRootNext
)
select pcid, pname, Tag as tagCID, Problem as problemCID
from t
pivot(
	sum(cid)
	for ename in ([tag], problem)
) s
GO
GRANT SELECT
    ON OBJECT::[dbo].[vd_JudgeRootNextPivot_Pub] TO [WiseLingPublic]
    AS [dbo];

