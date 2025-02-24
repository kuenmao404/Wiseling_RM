CREATE view Anl.vd_CourseMember as
select courseCID, courseName, gname, mid, name, sso, email, img, since, lastLoginDT 
from dbo.vd_CourseMember