CREATE view vd_Course_Pub as
select [pcid], [cid], courseName, [courseDes], [logo], [ownerMID], [name], [tags], courseStatus, [joinStatus], [nObject], since, lastModifiedDT,  hide
from vd_Course 
where courseStatus = 0 and hide = 0
GO
GRANT SELECT
    ON OBJECT::[dbo].[vd_Course_Pub] TO [WiseLingPublic]
    AS [dbo];

