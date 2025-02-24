CREATE view vd_ClassForum as
select cf.cid, f.fid, f.title, f.tid, f.content, f.tag, f.mid, f.name, f.img, f.sso,
		f.bBest, f.bTop, f.nLike, f.nC, f.bUpdate, f.nlevel, f.lastModifiedDT, f.since
from CF, vd_Forum f
where CF.FID = f.FID and nlevel = 1