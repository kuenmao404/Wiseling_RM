CREATE view vd_MemberClassCourse as
select V.mid, V.name 'myname', v.CID 'ncid', v.CName 'nname', c.ownerMID, m.name,
	c.cid, c.CName 'courseName', c.EDes 'logo', c.CDes 'courseDes',
	(select t.tid, t.text from CT, Tag t where ct.CID = c.CID and ct.TID = t.TID order by Rank for json auto) 'tags',
	c.cRank 'courseStatus', c.oRank 'joinStatus', c.nObject, replace(convert(varchar, c.Since, 111), '/', '-') 'since'
from vd_MemberClassCourseNext v, Inheritance I, Class C, vs_Member m
where v.CName = '我的課程' and v.CID = i.PCID and i.CCID = c.CID and c.bHided = 0 and c.bDel = 0  and c.OwnerMID = m.MID
union
select V.mid, V.name 'myname', v.CID 'ncid', v.CName 'nname', c.ownerMID, m.name,
	c.cid, c.CName 'courseName', c.EDes 'logo', c.CDes 'courseDes', 
	(select t.tid, t.text from CT, Tag t where ct.CID = c.CID and ct.TID = t.TID order by Rank for json auto) 'tags',
	c.cRank 'courseStatus', c.oRank 'joinStatus', c.nObject, replace(convert(varchar, c.Since, 111), '/', '-') 'since'
from vd_MemberClassCourseNext v, CRel cr, Class C, vs_Member m
where v.CName = '加入課程' and v.CID = cr.PCID and cr.CCID = c.CID and c.bHided = 0 and c.bDel = 0 and c.OwnerMID = m.MID