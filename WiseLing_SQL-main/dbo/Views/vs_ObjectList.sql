create view vs_ObjectList
as
	select	co.CID, co.Rank, o.OID, o.Type, o.CName, 
			o.Since, o.LastModifiedDT, o.OwnerMID, o.nClick, o.bHided, o.bDel  
	from	CO, Object o
	where	co.OID = o.OID