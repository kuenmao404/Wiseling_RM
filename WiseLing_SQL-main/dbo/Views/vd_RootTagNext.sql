create view vd_RootTagNext as
select v.CID as PCID, v.CName as PName, c.CID, c.Type, c.CName, c.EName, c.NamePath, c.IDPath, c.nLevel
from vd_RootTag v, Inheritance i, Class c
where  v.CID = i.PCID and i.CCID = c.CID