create view vd_VideoProblem_Pub as
select v.vid, v.title 'videoTitle', v.videoID, p.pid, p.title, p.difficulty, p.tag
from vd_Video_Pub v, ORel o, vd_ProblemTag_Pub p
where v.vid = o.OID1 and o.OID2 = p.pid
GO
GRANT SELECT
    ON OBJECT::[dbo].[vd_VideoProblem_Pub] TO [WiseLingPublic]
    AS [dbo];

