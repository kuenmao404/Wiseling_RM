CREATE view vd_ApplyCourse as
select AID 'applyID', CourseCID 'cid', applyStatus,
	applyMID, v.Name 'applyName', v.sso, v.email, cast(convert(varchar, a.Since, 120) as varchar) 'since',
	handelMID, v2.Name 'handleName', cast(convert(varchar, a.HandelDate, 120) as varchar) 'handleDate'
from ApplyHistoryCourse a
left join vs_Member v
on a.ApplyMID = v.MID
left join vs_Member v2
on a.HandelMID = v2.MID
where a.bDel = 0