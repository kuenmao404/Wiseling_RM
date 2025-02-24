CREATE view vd_MemberNote_PList as
with t as(
	select v.cid, n.nid, n.vid, n.contentNTID, n.content, n.lastModifiedDT, n.startTime, n.endTime, v.mid, n.cid as notebookCID, n.cname as notebook
	from vd_MemberClassPList v, vd_MemberNoteClass_Front n
	where v.mid = n.mid 

)
select t.cid, notebookCID, noteBook, t.nid, t.vid, t.contentNTID, t.content, t.lastModifiedDT, t.startTime, t.endTime, t.mid, cast(iif(NC.CID is null, 0, 1) as bit) as bExists
from t 
left join NC
on t.cid = NC.cid and NC.NID = t.nid