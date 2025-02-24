create function fs_getNamePath(@PCID int, @CName nvarchar(255))
	returns nvarchar(900)
as
begin
	declare @nLevel int = (select nLevel from Class where CID = @PCID)
	declare @NamePath nvarchar(900)
	if (@nLevel = 0)
		set @NamePath = @CName
	else
		set @NamePath = (select NamePath + '/' + @CName from Class where CID = @PCID)
	return @NamePath
end