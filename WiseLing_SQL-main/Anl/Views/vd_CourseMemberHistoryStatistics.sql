CREATE view Anl.vd_CourseMemberHistoryStatistics as
select [courseCID], [courseName], [身分], [mid], [name], [email], [登入平台], [加入日期], [總學習紀錄數量], [學習天數], [影片學習紀錄數量], [筆記學習紀錄數量], [影片總學習時間], [最長影片學習時間], [平均影片學習時間], [筆記總長度], [最長筆記長度], [筆記平均長度] 
from dbo.vd_CourseMemberHistoryStatistics