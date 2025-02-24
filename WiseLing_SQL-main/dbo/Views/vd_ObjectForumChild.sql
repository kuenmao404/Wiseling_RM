

CREATE view vd_ObjectForumChild as
select O.oid, pfid, f.fid, f.title, f.tid, f.content, f.mid, f.name, f.img, f.sso,
		f.bBest, f.bTop, f.nLike, f.nC, f.bUpdate, f.nlevel, f.lastModifiedDT, f.since
from OForum O, vd_ForumChild f
where O.FID = f.pfid