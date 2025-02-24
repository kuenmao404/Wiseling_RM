
CREATE view  vd_ArchiveClass as
select c.CID, v.OID, v.FileName, v.FileExtension, v.ContentLen, v.DataByte, v.bHided, v.CTID, v.ContentType, v.UUID, v.Path, v.URL
from vd_Archive v, OC, Class c 
where v.OID = OC.OID and OC.CID = c.CID and c.bDel = 0 and v.bDel = 0