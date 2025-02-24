CREATE view vd_ObjectForum as
select O.oid, f.fid, f.title, f.tid, f.content, f.tag, f.mid, f.name, f.img, f.sso,
		f.bBest, f.bTop, f.nLike, f.nC, f.bUpdate, f.nlevel, f.lastModifiedDT, f.since
from OForum O, vd_Forum f
where O.FID = f.FID and nlevel = 1