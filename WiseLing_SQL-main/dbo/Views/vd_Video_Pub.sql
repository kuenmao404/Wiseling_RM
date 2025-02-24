CREATE view vd_Video_Pub as
select v.vid, o.Type, O.CName 'title', V.desLong, 
	V.likeCount, V.unLikeCount, V.videoID, V.viewCount, o.bHided 'hide',
	C.CID 'channelCID', C.channelID, C.channelTitle, v.duration, convert(varchar, o.Since, 120) 'since',
	(
		select p.pid, p.title, p.difficulty, p.tag
		from ORel r, vd_ProblemTag_Pub p
		where v.vid = r.OID1 and r.OID2 = p.pid
		for json auto, include_null_values
	) 'problem', o.nOutlinks 'nP'
from Object O, URL U, Video V, Channel C
where O.Type = 18 and O.OID = U.UID and U.UID = V.VID and V.ChannelCID = C.CID and O.bDel = 0 and O.bHided = 0
GO











GO
GRANT SELECT
    ON OBJECT::[dbo].[vd_Video_Pub] TO [WiseLingPublic]
    AS [dbo];

