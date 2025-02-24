CREATE view vd_ForumChild as
select pf.fid as pfid, f.fid, f.title, f.tid, f.content, f.mid, f.name, f.img, f.sso,
		f.bBest, f.bTop, f.nLike, f.nC, f.bUpdate, f.nlevel, f.lastModifiedDT, f.since
from Forum pf, ForumRel r, vd_Forum f
where pf.bDel = 0 and pf.FID = r.FID1 and r.FID2 = f.FID