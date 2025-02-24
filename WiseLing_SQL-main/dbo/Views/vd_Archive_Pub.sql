CREATE view vd_Archive_Pub as
select [OID], [Type], [FileName], [FileExtension], [ContentLen], [CTID], ContentType, [UUID], [Path], [URL]
from vd_Archive
where bDel = 0 and bHided = 0 and DataByte = 0
GO
GRANT SELECT
    ON OBJECT::[dbo].[vd_Archive_Pub] TO [WiseLingPublic]
    AS [dbo];

