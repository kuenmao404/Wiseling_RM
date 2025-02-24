CREATE view vd_VListNewSubClass as
select pc.cid as pcid, pc.ownerMID, 
	cc.cid, cc.CName as vListName, cc.CDes as vListDes, 
	f.namepath, f.idpath, cc.bHided as hide, convert(varchar, cc.LastModifiedDT, 120) as lastModifiedDT,
	cc.nLevel - 3 as nlevel, cc.nObject as nO, cc.nClick as nC , i.rank
from Class pc, Inheritance i, Class cc
cross apply fn_getClassPathFormEnd(cc.cid, cc.nLevel - 3) f
where pc.CID = i.PCID and i.CCID = cc.CID
and pc.type = 34 and cc.type = 34 and pc.nLevel > 2 and pc.bDel = 0 and cc.bDel = 0