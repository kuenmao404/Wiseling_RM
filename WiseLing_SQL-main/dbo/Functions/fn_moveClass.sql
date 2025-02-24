CREATE  function [dbo].[fn_moveClass](@CID int, @PCID int)
	returns @table table (
		PCID int, PName nvarchar(max), PNamepath nvarchar(max), PIDPath nvarchar(max), PnLevel int,
		CCID int, CName nvarchar(max), NamePath nvarchar(max), IDPath nvarchar(max), nLevel int
	)
as
begin
	declare @namepath nvarchar(max), @cname nvarchar(256), @idpath nvarchar(max), @nLevel int
	
	-- 取得PCID Path，此為Root
	select @namepath = NamePath, @idpath = IDPath, @cname = CName, @nLevel = nLevel from Class where CID = @PCID

	if(@cname is null)
		return

	-- 從Root開始重組NamePath與IDPath	
	;with tmp as(
		select @PCID 'PCID', @cname 'PName', @namepath 'PNamepath', @idpath 'PIDPath', @nlevel 'PnLevel',
				CID 'CCID', CName, @namepath + '/' + CName 'Namepath', @idpath + '/' + cast(@CID as varchar) 'IDPath',
				@nLevel + 1 'nLevel'
		from Class 
		where CID = @CID
		union all
		select t.CCID 'PCID', T.CName 'PName', t.Namepath 'PNamepath', t.IDPath 'PIDPath', t.nlevel 'PnLevel',
				C2.CID 'CCID', C2.CName, t.Namepath + '/' + C2.CName 'Namepath', t.IDPath + '/' + cast(c2.CID as varchar) 'IDPath',
				t.nLevel + 1 'nLevel'
		from tmp t, Inheritance I, Class C2
		where t.CCID = I.PCID and I.CCID = C2.CID
	)
	insert into @table
		select * from tmp

	return
end