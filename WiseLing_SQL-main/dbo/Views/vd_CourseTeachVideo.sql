CREATE view vd_CourseTeachVideo as
select v.courseCID, v.courseName, v.cid, v.cname, v.type, c.cid 'cid_vid', p.vid, p.videoID
from vd_CourseNext v, Inheritance I, Class c, vd_Video_Pub p
where v.cname = '教材' and v.cid = i.PCID and i.CCID = c.CID and c.CName = cast(p.vid as varchar)
and c.bDel = 0 and c.bHided = 0