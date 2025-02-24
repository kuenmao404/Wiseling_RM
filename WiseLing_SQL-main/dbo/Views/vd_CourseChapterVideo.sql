CREATE view vd_CourseChapterVideo as
select c.[courseCID], c.[courseStatus], c.[cid], c.[hide] 'c_hide', 
v.vid, v.videoID, v.title, v.desLong, v.channelCID, v.channelID, v.channelTitle, v.viewCount, v.likeCount, v.unLikeCount, v.duration, co.rank
from vd_CourseChapter c, CO, vd_Video_Pub v
where c.cid = co.CID and co.OID = v.vid