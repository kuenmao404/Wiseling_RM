CREATE view vd_Video as
select v.vid, O.CName 'title', V.desLong, 
	V.likeCount, V.unLikeCount, V.videoID, V.viewCount, o.bHided 'hide',
	C.CID 'channelCID', C.channelID, C.channelTitle, v.duration, convert(varchar, o.Since, 120) 'since', o.nOutlinks 'nP'
from Object O, URL U, Video V, Channel C
where O.Type = 18 and O.OID = U.UID and U.UID = V.VID and V.ChannelCID = C.CID and O.bDel = 0 and O.bHided = 0