CREATE view Anl.vd_Course as
select cid, courseName, courseDes, logo, ownerMID, tags, courseStatus, joinStatus, nObject, since, lastModifiedDT
from dbo.vd_Course