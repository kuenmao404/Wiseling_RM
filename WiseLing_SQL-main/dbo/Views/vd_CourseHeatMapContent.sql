CREATE view vd_CourseHeatMapContent as
with t as(
	select ch.courseCID, v.MapID, v.MID, v.Type, v.ID, e.cname, v.duration, v.date, v.datatype, v.ntid,
			(case v.datatype when 0 then '新增' when 1 then '刪除' when 2 then '更新' end) 'action', v.Since
	from vd_CourseNext ch, vd_CalendarHeatMap_sys v, Entity e 
	where ch.type = 13 and ch.CID = v.CID and v.type = e.EID
)
select v.courseCID, v.courseName, v.mid, t.mapID, t.type, t.ID, t.cname, t.ntid, t.duration, t.date, t.datatype, action, t.Since
from vd_CourseClassGroupMember v
left join t
on v.mid = t.MID and v.courseCID = t.courseCID