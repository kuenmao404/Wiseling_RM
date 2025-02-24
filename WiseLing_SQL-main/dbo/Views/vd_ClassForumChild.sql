CREATE view vd_ClassForumChild as
select CID, pfid, f.fid, f.title, f.tid, f.content, f.mid, f.name, f.img, f.sso,
		f.bBest, f.bTop, f.nLike, f.nC, f.bUpdate, f.nlevel, f.lastModifiedDT, f.since
from CF, vd_ForumChild f
where cf.FID = f.pfid