CREATE view vd_CourseChapterItem as
select c.[courseCID], c.[courseStatus], c.[cid], c.[hide] 'c_hide', 
		o.oid, e.ename as typeName, o.type, o.CName 'title', v.videoID, p.difficulty, p.tag, co.rank,
		iif(o.Type = 20, (
			select count(*) 
			from vd_courseNext cn, CourseProblemMStatus cp 
			where c.courseCID = cn.courseCID and cn.type = 32 and cn.cid = cp.CID and cp.PID = o.OID and cp.bAccept = 1
		), null) as nAccept
from vd_CourseChapter c, CO, Object o
left join vd_Video_Pub v
on o.OID = v.vid
left join vd_ProblemTag_Pub p
on o.oid = p.pid
left join Entity e
on o.Type = e.EID
where c.cid = co.CID and co.OID = o.OID and o.Type in (18, 20)