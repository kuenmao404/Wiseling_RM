CREATE view vd_COVideo as
select co.CID, v.vid, v.videoID, v.title, v.desLong, v.channelCID, v.channelID, v.channelTitle, v.viewCount, v.likeCount, v.unLikeCount, v.duration, CO.rank, v.hide
from CO, vd_Video_Pub v
where co.OID = v.vid