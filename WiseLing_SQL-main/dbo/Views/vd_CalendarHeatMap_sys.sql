CREATE view vd_CalendarHeatMap_sys as
select c.mapID, c.cid, c.date, c.nC, h.hid, h.type, h.id,
	h.datatype, 
	h.duration, h.ntid, h.mid, h.since, h.lastModifiedDT, h.bDel
from CalendarHeatMap c, MapH m, HeatMapContent h
where c.MapID = m.MapID and m.HID = h.HID