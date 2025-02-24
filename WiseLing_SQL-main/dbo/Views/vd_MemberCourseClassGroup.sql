CREATE view vd_MemberCourseClassGroup as
select m.mid, m.name, m.sso, convert(varchar, m.LastLoginDT, 120) 'lastLoginDT', 
		v.PCID 'courseCID', PName 'courseName', v.cid, v.CName 'gname', EName 'gename', v.gid
from vs_Member m, OC, vd_CourseClassGroup v
where m.MID = OC.OID and OC.CID = v.CID