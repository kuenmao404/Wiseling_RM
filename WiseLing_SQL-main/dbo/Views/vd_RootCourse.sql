CREATE view vd_RootCourse
as
select c.CID 'PCID', c.CName 'PName', cc.CID, cc.Type, cc.CName, cc.EName, cc.IDPath, cc.NamePath
from Class c, Inheritance i, Class cc
where c.cid = 0 and c.CID = i.PCID and i.CCID = cc.CID and cc.CName = '課程' and cc.Type = 6