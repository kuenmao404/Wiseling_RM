create view vs_SubClass
as
	select	i.PCID as CID, i.Rank,
			c.CID as CCID, c.Type, c.CName, c.CDes,
			c.Since, c.LastModifiedDT, c.nObject, c.nClick, c.Keywords, c.OwnerMID, 
			c.bHided, c.bDel
	from	Inheritance i, Class c
	where	i.CCID = c.CID