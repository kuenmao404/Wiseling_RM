CREATE view vd_MemberClassPList as
select v.mid, v.CID 'pcid', v.hide 'p_hide', c.cid, c.cname 'vListName', c.CDes 'vListDes', c.nClick as nC, c.nObject as nO, convert(varchar, c.LastModifiedDT, 120) 'lastModifiedDT' , c.bHided 'hide' , i.rank  
from vd_ClassMemberNext v, Inheritance i, Class c
where v.type = 15 and v.CID = i.PCID and i.CCID = c.CID and c.bDel = 0