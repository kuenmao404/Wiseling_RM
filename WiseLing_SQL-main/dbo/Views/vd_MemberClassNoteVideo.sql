CREATE view vd_MemberClassNoteVideo as
select v.MID, v.ClassID, v.Img, v.Name, v.EMail, v.SSO, v.CID 'PCID', v.CName 'PName', 
c.CID 'CID_VID', p.VID, p.title, p.videoID, p.channelCID, p.channelTitle, p.channelID, c.NamePath, c.IDPath, c.nObject as nO
from vd_ClassMemberNext v, Inheritance i, Class c, vd_Video_Pub p
where v.CName = '筆記本' and v.CID = i.PCID and i.CCID = c.CID and c.bDel = 0 and c.bHided = 0
and c.CName = cast(p.vid as varchar)