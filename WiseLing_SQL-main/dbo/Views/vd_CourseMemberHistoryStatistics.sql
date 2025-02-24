CREATE view vd_CourseMemberHistoryStatistics  as
with cte as(
	select t.courseCID, t.courseName, mid, 
			count(distinct [date]) 'day',
			sum(iif(Type = 18, 1, 0)) as videoC, 
			sum(iif(Type = 5, 1, 0)) as noteC, 
			convert(varchar, DATEADD(ss, sum(iif(type = 18, Duration, 0)), 0), 108) as 'sumVideoViewTime',
			convert(varchar, DATEADD(ss, max(iif(type = 18, Duration, null)), 0), 108)  as 'maxVideoViewTime',
			convert(varchar, DATEADD(ss, avg(iif(type = 18, isnull(Duration, 0), null)), 0), 108)  as 'avgVideoViewTime'
	from vd_CourseHeatMapContent t
	group by courseCID, courseName, MID
)
select v.courseCID, v.courseName, gname '身分', v.mid, v.name, m.email, sso '登入平台', since '加入日期', 
	(cte.videoC +  cte.noteC) '總學習紀錄數量',  cte.day '學習天數', cte.videoC '影片學習紀錄數量', cte.noteC '筆記學習紀錄數量', 
	cte.[sumVideoViewTime] '影片總學習時間', cte.[maxVideoViewTime] '最長影片學習時間', cte.[avgVideoViewTime] '平均影片學習時間',
	cn.sumLenNote '筆記總長度', cn.maxLenNote '最長筆記長度', cn.avgLenNote '筆記平均長度'
from vd_CourseClassGroupMember v, Member m, cte, vd_CourseHeatMapContentNote cn
where v.courseCID = cte.courseCID and v.mid = m.mid and m.MID = cte.MID and v.courseCID = cn.courseCID and m.MID = cn.mid