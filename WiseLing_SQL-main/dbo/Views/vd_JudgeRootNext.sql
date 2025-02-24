CREATE view vd_JudgeRootNext as
select v.CID as PCID, v.CName as PName, c.CID, c.Type, c.CName, c.EName
from vd_JudgeRoot v, Inheritance i, Class c
where v.CID = i.PCID and i.CCID = c.cid