CREATE view vd_CourseCalenderHeatMap as
select  v.courseCID, v.courseName, v.mapID, v.cid, v.date, v.nC, 
	h.hid, h.mid, h.type, h.id, h.datatype, h.duration, h.ntid, 
	convert(varchar, h.since, 120) as since, 
	convert(varchar, h.lastModifiedDT, 120) as lastModifiedDT
from vd_CourseCalender v, MapH, HeatMapContent h
where v.mapID = MapH.mapID and MapH.HID = h.HID and h.bDel = 0 and h.Datatype <> 1