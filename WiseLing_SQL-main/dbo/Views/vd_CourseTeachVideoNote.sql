CREATE view vd_CourseTeachVideoNote as
select v.courseCID, v.courseName, v.cid, v.cname, v.type, v.cid_vid, v.vid, 
		n.nid, n.contentNTID, nt.Text 'content', n.startTime, n.endTime, 
		m.MID 'lastModifiedMID', m.Name, m.Account, m.SSO, convert(varchar, n.LastModifiedDT, 120) 'lastModifiedDT'
from vd_CourseTeachVideo v, CNCourse CN, NoteCourse N, NText nt, vs_Member m
where v.cid_vid = cn.CID and cn.NID = n.NID and n.bDel = 0 and v.courseCID = n.CourseCID and v.vid = n.VID
and n.ContentNTID = nt.NTID and N.OwnerMID = m.MID