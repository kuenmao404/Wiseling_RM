
create view vd_RootNext as
select v.CID 'PCID', v.CName 'PName', c.CID, c.Type, c.CName, c.EName, c.NamePath, c.IDPath
from vd_Root v, Inheritance i, Class c
where v.CID = i.PCID and i.CCID = c.CID