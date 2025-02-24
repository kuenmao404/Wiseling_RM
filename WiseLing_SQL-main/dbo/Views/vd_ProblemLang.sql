CREATE view vd_ProblemLang as
select v.pid, pl.plid, pl.name, pl.[key], pl.fileExtension
from vd_Problem v, ORel, vd_PLanguage_Pub pl
where v.pid = ORel.OID1 and ORel.OID2 = pl.plid