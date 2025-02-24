CREATE view vd_SingleTagCourse as
select T.tid, T.text COLLATE Chinese_Taiwan_Stroke_CI_AS AS 'text', T.useCount, C.[cid], C.[cname], C.[cdes], C.[logo], C.[ownerMID], C.[name], C.[tags], C.courseStatus, C.[joinStatus], C.[nObject], since
from Tag T, TC, vd_Course C
where T.TID = TC.TID and TC.CID = C.cid