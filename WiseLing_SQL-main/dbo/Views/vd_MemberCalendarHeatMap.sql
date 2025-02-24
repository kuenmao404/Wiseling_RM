CREATE view vd_MemberCalendarHeatMap as
select v.mid 'ownerMID', c.cid, c.mapID, c.date, c.type, c.id, c.cname, c.datatype, c.action, convert(varchar, c.since, 120) 'since',
		c.data, c.duration
from vd_ClassMemberNext v, vd_CalendarHeatMap c
where v.type = 13 and v.CID = c.cid and c.datatype <> 1