CREATE view vd_MemberOP as
with t as(
	select v.mid, name, v.nickName, v.ssoName, account, img, email, sso, classID, convert(varchar, LastLoginDT, 120) as lastLoginDT, 
			convert(varchar, Since, 120) as since, 
			(select c.cid, c.type, c.cname, c.hide from vd_ClassMemberNext c where c.MID = v.MID for json auto) as data,
			g.gid, g.gname
	from vs_member v 
	left join vd_MGGroup g
	on v.mid = g.mid and g.Status = 1 and GName in ('Administrators', 'Judge管理員')
)
select mid, name, nickName, ssoName, img, email, sso, classID, lastLoginDT, since, data, 
	cast(iif([Administrators] is null, 0, 1) as bit) 'bOP',
	cast(iif([Judge管理員] is null, 0, 1) as bit) 'bJudgeOP'
from t
PIVOT (
	MAX(GID)
	for gname IN ([Administrators], [Judge管理員])
) p;