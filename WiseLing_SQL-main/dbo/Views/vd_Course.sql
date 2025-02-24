CREATE view vd_Course as
select v.cid 'pcid', c.cid, c.cname 'courseName', c.cdes 'courseDes', c.EDes 'logo', c.ownerMID, m.name, 
	(select t.tid, t.text from CT, Tag t where ct.CID = c.CID and ct.TID = t.TID order by Rank for json auto) 'tags',
	c.cRank 'courseStatus', c.oRank 'joinStatus', c.nObject, 
	cast(cast(c.Since as date) as nvarchar(50)) 'since', cast(cast(c.LastModifiedDT as date) as nvarchar(50)) 'lastModifiedDT', c.bHided 'hide'
from vd_RootCourse v, CRel r, Class C, vs_Member m
where v.CID = r.PCID and r.CCID = c.CID and C.bDel = 0 and c.OwnerMID = m.MID