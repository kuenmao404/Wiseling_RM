CREATE view vd_MemberClassNoteBook_New_Pub as
select v.mid as ownerMID, v.sso, v.name, v.img, 
	c.cid, c.cdes as cname,  c.cRank as bDefault,
	p.vid, p.title, p.videoID, p.channelCID, p.channelTitle, p.channelID, 
	c.nObject as nO, c.nClick as nC, convert(varchar, c.LastModifiedDT, 120) 'lastModifiedDT',
	c.bHided as hide, p.title + c.cname 'search_str'
from vd_ClassMemberNext v, Inheritance i, Class c, vd_Video_Pub p
where v.type = 19 and v.CID = i.PCID and i.CCID = c.CID and c.bDel = 0
and c.ID = p.vid and c.bHided = 0
GO
GRANT SELECT
    ON OBJECT::[dbo].[vd_MemberClassNoteBook_New_Pub] TO [WiseLingPublic]
    AS [dbo];

