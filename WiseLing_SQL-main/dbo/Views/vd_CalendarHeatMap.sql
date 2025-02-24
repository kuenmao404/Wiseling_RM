CREATE view vd_CalendarHeatMap as
select c.cid, c.mapID, c.date, h.hid, h.mid as ownerMID, h.type, h.id, e.cname,
	h.datatype, (case h.datatype when 0 then '新增' when 1 then '刪除' when 2 then '更新' end) 'action', 
	h.duration, convert(varchar, h.since, 120) as since, convert(varchar, h.LastModifiedDT, 120) as lastModifiedDT,
	dbo.fn_getCalendarHeatMapData(h.id, h.type, h.NTID, 0) data
from CalendarHeatMap c, MapH m, HeatMapContent h, Entity e
where c.MapID = m.MapID and m.HID = h.HID and h.bDel = 0 and h.Type = e.EID