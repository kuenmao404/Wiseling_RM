create view vd_CourseClassGroup_Classonly as
/*
select v.PCID, v.PName, v.CID 'NCID', v.CName 'NCName', C.CID, C.CName, C.EName, C.IDPath, C.NamePath
from vd_RootGroup v, Inheritance I, Class C
where v.CID = I.PCID and I.CCID = C.CID
union all
*/
select v.cid 'PCID', v.courseName 'PName', c.CID 'NCID', c.CName 'NCName', cc.CID, cc.CName, cc.EName
from vd_Course v, Inheritance i, Class c, Inheritance ii, Class cc
where v.cid = i.PCID and i.CCID = c.CID and c.Type = 8
and c.CName = '群組' and c.CID = ii.PCID and ii.CCID = cc.CID