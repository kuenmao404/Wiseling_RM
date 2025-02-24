CREATE view vd_MemberClassNoteBook_Pub as
select v.mid as ownerMID, v.sso, v.name, v.img, v.cid_vid, 
v.vid, v.title, v.videoID, v.channelCID, v.channelTitle, v.channelID, 
c.cid, c.cname, c.cRank as bDefault, convert(varchar, c.LastModifiedDT, 120) 'lastModifiedDT', c.nObject 'nO',
	 v.title + c.cname + v.channelTitle 'search_str', c.bHided
from vd_MemberClassNoteVideo v, Inheritance i, Class c
where v.CID_VID = i.PCID and i.CCID = c.CID and c.bHided = 0 and c.bDel = 0
GO
GRANT SELECT
    ON OBJECT::[dbo].[vd_MemberClassNoteBook_Pub] TO [WiseLingPublic]
    AS [dbo];

