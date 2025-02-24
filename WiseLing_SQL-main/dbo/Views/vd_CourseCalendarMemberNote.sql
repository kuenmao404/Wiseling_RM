CREATE view vd_CourseCalendarMemberNote as
select courseCID, v.cid, date, hid, mid as ownerMID,
	datatype, (case datatype when 0 then '新增' when 1 then '刪除' when 2 then '更新' end) 'action', 
	duration, iif(n.bDel = 0, nt.text, '# 此筆記已刪除') as content, nt.length as contentLength,
	v.since
from vd_CourseCalenderHeatMap v, Note n, NText nt
where v.id = n.nid and v.ntid = nt.NTID