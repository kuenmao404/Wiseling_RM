CREATE view vd_PlangContentType as
select v.plid, v.name, c.ctid, c.title as contentType, v.fileExtension
from vd_PLanguage_Pub v, OCT, ContentType c
where v.plid = oct.OID and oct.CTID = c.CTID