create view vd_ClassProblem as
select v.pid, v.classID, c.cid, c.type, c.cname
from vd_Problem v, Inheritance i, Class c
where v.classID = i.PCID and i.CCID = c.CID