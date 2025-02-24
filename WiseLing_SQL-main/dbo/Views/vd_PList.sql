CREATE view vd_PList as
select  c.cid, c.cname as vListName, c.CDes as vListDes, c.nClick as nC, c.nObject as nO, c.bHided as hide, c.ownerMID, v.name, v.sso
from Class c, vs_Member v
where c.Type = 15 and c.nLevel = 4 and c.bDel = 0 and c.OwnerMID = v.MID and c.EDes is null