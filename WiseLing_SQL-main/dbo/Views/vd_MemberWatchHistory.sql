CREATE view vd_MemberWatchHistory as
select  m.mid, m.classID, c.mapID, c.hid, cast(c.date as varchar) as date, c.duration 'myDuraction', c.since, 
	v.vid, v.title, v.videoID, v.channelCID, v.channelID, v.channelTitle, v.duration, v.viewCount
from Member mm, vd_ClassMemberNext m, vd_CalendarHeatMap c, vd_Video_Pub v
where mm.mid = m.mid and mm.ClassID = m.ClassID and m.Type = 27 and m.CID = c.cid and c.type = 18 and c.id = v.vid