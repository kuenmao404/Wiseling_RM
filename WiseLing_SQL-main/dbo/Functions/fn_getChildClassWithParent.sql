CREATE  function [dbo].[fn_getChildClassWithParent](@CID int)
	returns @table table (
		PCID int, PName nvarchar(max), CCID int, CName nvarchar(max), CDes nvarchar(max), 
		EName nvarchar(max), EDes nvarchar(max), Type int, NamePath nvarchar(max), IDPath nvarchar(max), nLevel int, bDel bit, bHided bit, bChild bit, nObject int, Rank int
	)
as
begin
	
	declare @pcid int = dbo.fn_getClassPCID(@CID)
	if(@pcid is null)
		insert into @table
			select null 'PCID', null 'PName', 
				C2.CID 'CCID', C2.CName, C2.CDes, C2.EName, C2.EDes, C2.Type, C2.NamePath, C2.IDPath, C2.nLevel, C2.bDel, C2.bHided, C2.bChild, C2.nObject bit, null as Rank
			from Class C2
			where C2.CID = @CID
	else
		insert into @table
			select C1.CID 'PCID', C1.CName 'PName', 
				C2.CID 'CCID', C2.CName, C2.CDes, C2.EName, C2.EDes, C2.Type, C2.NamePath, C2.IDPath, C2.nLevel, C2.bDel, C2.bHided, C2.bChild, C2.nObject bit, I.Rank
			from Class C1, Inheritance I, Class C2
			where C1.CID = @pcid and I.PCID = C1.CID and I.CCID = C2.CID and C2.CID = @CID
	
	
	;with tmp as(
		select C1.CID 'PCID', C1.CName 'PName', 
		C2.CID 'CCID', C2.CName, C2.CDes, C2.EName, C2.EDes, C2.Type, C2.NamePath, C2.IDPath, C2.nLevel, C2.bDel, C2.bHided, C2.bChild, C2.nObject bit, I.Rank
		from Class C1, Inheritance I, Class C2
		where C1.CID = @CID and C1.CID = I.PCID and I.CCID = C2.CID
		union all
		select t.CCID 'PCID', T.CName 'PName', C2.CID 'CCID', C2.CName, C2.CDes, C2.EName, C2.EDes, C2.Type, C2.NamePath, C2.IDPath, C2.nLevel, C2.bDel, C2.bHided, C2.bChild, C2.nObject bit, I.Rank
		from tmp t, Inheritance I, Class C2
		where t.CCID = I.PCID and I.CCID = C2.CID
	)
	insert into @table
		select * from tmp

	
	return
end