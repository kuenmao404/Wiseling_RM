CREATE view vd_InviteHistory as
with t as(
	select iid, [CourseCID] as cid, c.pname 'courseName', c.cid 'gcid', c.gid, c.cname 'gname', [inviteMID], m.name 'inviteName', 
		i.[token], i.[email], i.[sendEMailOK], 
		convert(varchar, i.since, 120) 'since', convert(varchar, i.[expiredDT], 120) 'expiredDT', 
		i.[activeMID], i.[activeDate], i.[bActive], i.[groupCID],
		i.bDel
	from  InviteHistory i, vs_Member m, vd_CourseClassGroup c
	where m.MID = i.InviteMID and i.CourseCID = c.PCID and c.CID = i.GroupCID
)
select iid, t.cid, t.courseName, gcid, gid, gname, [inviteMID], t.inviteName, [token], t.[email], t.[sendEMailOK], t.[since], t.[expiredDT], t.[activeMID], m.Name 'activeName', t.[activeDate], t.[bActive], t.[groupCID], t.bDel,
		dbo.fn_getEMailState(t.sendEMailOK, t.bActive, t.bDel , t.expiredDT ) 'state'
from t
left join vs_Member m
on t.ActiveMID = m.MID