
CREATE view vd_CourseCalendarMember as
with t as(
	select mapID, cid, mid, type, count(*) as nC, sum(Duration) as duration
	from vd_CourseCalenderHeatMap
	group by mapID, cid, mid, type 
)
select t.mapID, t.cid, t.mid as ownerMID, v.name, v.sso, v.img, t.type, t.nC, t.duration
from t, vs_Member v
where t.MID = v.MID