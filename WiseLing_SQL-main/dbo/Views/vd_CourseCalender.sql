CREATE view vd_CourseCalender as
select v.courseCID, v.courseName, c.mapID, c.cid, cast(c.date as varchar) as date, c.nC
from vd_CourseNext v, CalendarHeatMap c
where v.cid = c.CID