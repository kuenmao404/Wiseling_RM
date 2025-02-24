create view dbo.vs_Archive
as
select	o.OID, O.[Type], o.CName, o.CDes, 
		a.[FileName], a.FileExtension, c.Title as MIMEType, o.nClick, 
		a.Keywords, a.Lang, a.Indexable, a.IndexInfo, o.Since, o.LastModifiedDT,
		o.bHided, o.bDel
from	Archive a, Object o, ContentType c
where	a.AID = o.OID and a.ContentType = c.CTID