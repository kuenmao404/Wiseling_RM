CREATE view vd_MileStone_Pub as
select m.msid, cast(m.date as varchar) as date, n.Text as content, convert(varchar, m.LastModifiedDT, 120) as lastModifiedDT
from MileStone m, NText n
where m.ContentNTID = n.NTID and m.bDel = 0
GO
GRANT SELECT
    ON OBJECT::[dbo].[vd_MileStone_Pub] TO [WiseLingPublic]
    AS [dbo];

