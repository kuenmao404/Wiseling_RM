create view vd_CourseMember as
select v.PCID 'courseCID', PName 'courseName', v.CName 'gname', m.mid, m.name, m.sso, m.email, m.img,
	replace(convert(varchar, CO.Since, 111), '/', '-') 'since', iif(bPrev = 1, null, convert(varchar, m.LastLoginDT, 120)) 'lastLoginDT', bPrev
from vd_CourseClassGroup v, CO, vs_Member m, MG
where v.CID = co.CID and co.OID = m.MID and m.MID = mg.MID and v.gid = mg.GID