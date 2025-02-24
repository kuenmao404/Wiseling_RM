create view vd_AlgorithmTag_Pub as
select c.cid, c.cname, c.ename, c.keywords, c.cname + c.ename + c.keywords as searchstr
from vd_RootTagNext v, Inheritance i, Class c
where v.CName = '演算法' and v.CID = i.PCID and i.CCID = c.CID
GO
GRANT SELECT
    ON OBJECT::[dbo].[vd_AlgorithmTag_Pub] TO [WiseLingPublic]
    AS [dbo];

