CREATE view vd_CourseNext as
select v.cid 'courseCID', courseName, v.ownerMID, v.name, v.courseStatus, c.cid, c.cname, c.ename, c.Type
from vd_Course v, Inheritance i, Class c
where v.cid = i.PCID and i.CCID = c.CID