CREATE view vd_Root as
select cid, type, cname, (select CID from vd_RootCourse) 'courseCID', (select CID from vd_RootMileStone) 'mileStoneCID'
from Class
where CID = 0
GO
GRANT SELECT
    ON OBJECT::[dbo].[vd_Root] TO [WiseLingPublic]
    AS [dbo];

