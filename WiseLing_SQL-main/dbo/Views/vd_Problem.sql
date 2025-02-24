CREATE view vd_Problem as
select P.pid, O.CName 'title', p.difficulty, p.keywords, originID, p.classID, p.time_limit, p.mem_limit
from Object O, Problem P
where o.bDel = 0 and o.bHided = 0 and O.OID = P.PID