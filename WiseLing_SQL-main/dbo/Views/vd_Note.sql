create view vd_Note as
select n.nid, n.vid, n.contentNTID, nt.Text 'content', convert(varchar, n.LastModifiedDT, 120) 'lastModifiedDT', n.ownerMID, n.startTime, n.endTime
from Note n, NText nt
where  n.ContentNTID = nt.NTID and n.bDel = 0