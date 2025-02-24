CREATE view vd_CourseClassGroupMember as
select v.PCID 'courseCID', PName 'courseName', v.cid, v.CName 'gname', EName 'gename', v.gid, mg.role, m.mid, m.name, m.sso, m.img,
	replace(convert(varchar, CO.Since, 111), '/', '-') 'since', iif(bPrev = 1, null, convert(varchar, m.LastLoginDT, 120)) 'lastLoginDT', bPrev
from vd_CourseClassGroup v, CO, vs_Member m, MG
where v.CID = co.CID and co.OID = m.MID and m.MID = mg.MID and v.gid = mg.GID