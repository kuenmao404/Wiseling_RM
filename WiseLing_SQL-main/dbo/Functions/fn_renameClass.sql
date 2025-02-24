CREATE  function [dbo].[fn_renameClass](@CID int, @newcname nvarchar(256))
	returns @table table (
		PCID int, PName nvarchar(max), PNamepath nvarchar(max), 
		CCID int, CName nvarchar(max), NamePath nvarchar(max)
	)
as
begin
	declare @namepath nvarchar(max), @cname nvarchar(max)  
	
	select @namepath = NamePath, @cname = CName from Class where CID = @CID

	-- 去掉尾端原CName，加上新CName，此為Root
	set @namepath = REVERSE(SUBSTRING(REVERSE(@namepath), len(@cname) + 1, len(@namepath))) + @newcname

	-- 從Root開始，重組NampPath
	;with tmp as(
		select C1.CID 'PCID', @newcname 'PName', @namepath 'PNamepath', 
				C2.CID 'CCID', C2.CName, @namepath + '/' + C2.CName 'Namepath'
		from Class C1, Inheritance I, Class C2
		where C1.CID = @CID and C1.CID = I.PCID and I.CCID = C2.CID
		union all
		select t.CCID 'PCID', T.CName 'PName', t.Namepath 'PNamepath',
				C2.CID 'CCID', C2.CName, t.Namepath + '/' + C2.CName 'Namepath'
		from tmp t, Inheritance I, Class C2
		where t.CCID = I.PCID and I.CCID = C2.CID
	)
	insert into @table
		select * from tmp


	declare @pcid int = dbo.fn_getClassPCID(@CID)
	if(@pcid is null)
		insert into @table
			select null 'PCID', null 'PName', null 'PNamepath', 
				C2.CID 'CCID', @newcname 'CName', @namepath 'Namepath'
			from Class C2
			where C2.CID = @CID
	else
		insert into @table
			select C1.CID 'PCID', C1.CName 'PName', C1.NamePath 'PNamepath',
				C2.CID 'CCID', @newcname 'CName', @namepath 'Namepath'
			from Class C1, Inheritance I, Class C2
			where C1.CID = @pcid and I.PCID = C1.CID and I.CCID = C2.CID and C2.CID = @CID

	return
end