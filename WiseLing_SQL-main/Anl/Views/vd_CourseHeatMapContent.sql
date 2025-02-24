CREATE view Anl.vd_CourseHeatMapContent as
select courseCID, courseName, mid, mapID, type, id, cname, ntid, duration, date, datatype, action, since 
from dbo.vd_CourseHeatMapContent