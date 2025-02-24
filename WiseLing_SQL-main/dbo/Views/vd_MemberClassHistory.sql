create view vd_MemberClassHistory as
select v.MID, v.CID 'PCID', v.Hide, c.CID, c.CName, c.Type, c.NamePath, c.IDPath
from vd_ClassMemberNext v, Inheritance I, Class c
where v.Type = 13 and v.CID = i.PCID and i.CCID = c.CID