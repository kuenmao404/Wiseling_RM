
CREATE view vd_CourseHistory as
select v.courseCID, c.CID, c.CName, c.Type, c.NamePath, c.IDPath
from vd_CourseNext v, Inheritance I, Class c
where v.Type = 13 and v.CID = i.PCID and i.CCID = c.CID