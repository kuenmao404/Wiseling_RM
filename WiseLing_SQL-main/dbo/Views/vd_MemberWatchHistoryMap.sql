CREATE view vd_MemberWatchHistoryMap as
select v.mid, c.mapID, c.cid, cast(c.date as varchar) as date, c.nC, year(date) as year
from vd_ClassMemberNext v, CalendarHeatMap c
where v.type = 27 and v.CID = c.CID