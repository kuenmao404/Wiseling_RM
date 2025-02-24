CREATE view vd_MemberNoteClass_Front as
select n.nid, n.vid, n.contentNTID, nt.Text 'content', convert(varchar, n.LastModifiedDT, 120) 'lastModifiedDT', 
	n.ownerMID 'mid', n.startTime, n.endTime, c.cid, c.cdes as cname
from  Note n, NText nt, CN, Class c
where n.ContentNTID = nt.NTID and CN.NID = n.NID and CN.CID = c.CID and c.Type = 19 and n.bDel = 0 
and c.bDel = 0