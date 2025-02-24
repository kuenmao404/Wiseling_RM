CREATE view vd_Archive as
select O.OID, O.Type, A.FileName, A.FileExtension, A.ContentLen, C.CTID, C.Title 'ContentType', A.UUID, O.CDes 'Path', O.EName 'URL', 
O.DataByte, o.Since, O.bDel, O.bHided 
from Object O, Archive A, ContentType C
where O.Type = 3 and O.OID = A.AID and A.ContentType = C.CTID