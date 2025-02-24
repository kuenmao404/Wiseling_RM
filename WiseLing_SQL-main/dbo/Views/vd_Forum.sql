CREATE view vd_Forum as
select f.fid, f.title, f.tid, t.Text as content, f.tag, v.mid, v.name, v.img, v.sso,
		f.bBest, f.bTop, f.nLike, f.nC, f.bUpdate, 
		f.nlevel, convert(varchar, f.lastModifiedDT, 120) as lastModifiedDT,  convert(varchar, f.since, 120) as since
from Forum f, Text t, vs_Member v	
where f.TID = t.TID and f.bDel = 0
	and f.mid = v.mid