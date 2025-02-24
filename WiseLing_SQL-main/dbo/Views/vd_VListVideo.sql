create view vd_VListVideo as
select v.ownerMID, v.cid as vListCID, c.type,
		c.cid, c.cdes as notebookName, 
		c.nObject as nO, c.nClick as nC, c.bHided as hide , 
		convert(varchar, c.LastModifiedDT, 120) 'lastModifiedDT',
		p.vid, p.title, p.videoID, p.channelCID, p.channelTitle, p.channelID, CRel.rank
from vd_VListNew v, CRel, Class c, vd_Video_Pub p
where v.cid = CRel.PCID and CRel.CCID = c.CID
and c.Type = 19 and v.ownerMID = c.OwnerMID and c.ID = p.vid and c.bDel = 0
union all
select v.ownerMID, v.cid as vListCID, p.type, 
		null as cid, null as notebookName, 
		null as nO, null as nC, null as hide , 
		null 'lastModifiedDT',
		p.vid, p.title, p.videoID, p.channelCID, p.channelTitle, p.channelID, CO.rank
from vd_VListNew v, CO, vd_Video_Pub p
where v.cid = co.cid and co.OID = p.vid