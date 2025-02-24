CREATE view vd_VListNew as
select cc.cid, iif(cc.nLevel = 3, '根目錄', cc.CName) as vListName, cc.CDes as vListDes, cc.ownerMID,
	f.namepath, f.idpath, cc.bHided as hide, convert(varchar, cc.LastModifiedDT, 120) as lastModifiedDT,
	cc.nLevel - 3 as nlevel, cc.nObject as nO, cc.nClick as nC 
from Class cc
cross apply fn_getClassPathFormEnd(cc.cid, cc.nLevel - 3) f
where cc.Type = 34 and nLevel > 2 and bDel = 0