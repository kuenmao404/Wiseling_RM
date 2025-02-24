CREATE view vd_ClassProblemTestCase as
select v.pid, v.cid, v.type, t.tcid,
		convert(varchar, t.Since, 120) as since, 
		iif(len(t.input) > 1000, substring(t.input, 1, 1000) + char(10) + '...' , t.input) as input,
		iif(len(t.output) > 1000, substring(t.output, 1, 1000) + char(10) + '...' , t.output) as output,  
		CTC.rank,
		t.ownerMID, m.name as owner, m.sso
from vd_ClassProblem v, CTC, TestCase t, vs_member m
where v.type = 30 and v.cid = CTC.CID and CTC.TCID = t.TCID and t.OwnerMID = m.MID and t.bDel = 0