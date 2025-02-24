CREATE view vd_PListNote as
select p.cid, p.vListName, p.hide, c.CID 'notebookCID', c.CDes 'notebookName', n.nid, n.contentNTID, n.content, n.startTime, n.endTime, v.vid, v.title, v.videoID, cn.rank
from vd_PList p, CN, vd_Note n, vd_Video_Pub v, nc, Class c
where p.cid = cn.CID and cn.NID = n.NID and n.vid = v.vid and n.nid = nc.NID and nc.CID = c.CID and c.bDel = 0 and c.Type = 19