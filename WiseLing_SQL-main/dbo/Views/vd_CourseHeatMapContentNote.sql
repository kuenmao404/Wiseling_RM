
create view vd_CourseHeatMapContentNote as
with t as(
	select courseCID, n.ownerMID, v.vid, n.nid, len(n.content) as lenNote
	from vd_CourseChapterVideo v, vd_Note n
	where v.vid = n.vid
	group by courseCID, ownerMID, v.vid, n.nid, len(n.content)
)
select v.courseCID, mid, isnull(sum(lenNote), 0) as sumLenNote, max(lenNote) as maxLenNote, avg(lenNote) as avgLenNote
from vd_CourseClassGroupMember v
left join t
on v.courseCID = t.courseCID and v.mid = t.ownerMID
group by v.courseCID, mid