CREATE view vd_AlgorithmTag as
select v.CID as PCID, v.CName as PName, c.CID, c.Type, c.CName, c.EName, c.Keywords, c.NamePath, c.IDPath, c.nLevel
from vd_RootTagNext v, Inheritance i, Class c
where v.CName = '演算法' and v.CID = i.PCID and i.CCID = c.CID