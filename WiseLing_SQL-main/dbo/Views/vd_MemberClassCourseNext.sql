
CREATE view vd_MemberClassCourseNext as
select V.MID, V.ClassID, v.SSOID, V.Name, v.Account, c.CID, c.Type, c.CName, c.NamePath, c.IDPath 
from vd_ClassMemberNext v, Inheritance I, Class c
where v.CName = '課程' and v.CID = i.PCID and i.CCID = c.CID