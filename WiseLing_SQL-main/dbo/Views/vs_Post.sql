create view dbo.vs_Post
as
select	o.OID, o.Type, o.CName, o.CDes, p.Detail, p.StartDT, p.EndDT, o.Since, o.LastModifiedDT,
		o.OwnerMID, o.bHided, o.bDel
from	Post p, Object o
where	p.PID = O.OID