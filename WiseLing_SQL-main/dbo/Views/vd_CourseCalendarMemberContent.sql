CREATE view vd_CourseCalendarMemberContent as
select courseCID, v.cid, mapID, date, hid, mid as ownerMID, v.type, id, e.cname,
	datatype, (case datatype when 0 then '新增' when 1 then '刪除' when 2 then '更新' end) 'action', 
	duration,
	dbo.fn_getCalendarHeatMapData(id, v.type, v.ntid, 1) data,
	v.since, v.lastModifiedDT
from vd_CourseCalenderHeatMap v, Entity e
where v.type = e.EID and v.Datatype <> 1