create function fs_getIDPath(@PCID int, @CID int)
	returns nvarchar(900)
as
begin
	declare @nLevel int = (select nLevel from Class where CID = @PCID)
	declare @IDPath nvarchar(900)
	if (@nLevel = 0)
		set @IDPath = convert(nvarchar(max), @CID)
	else
		set @IDPath = (select IDPath + '/' + convert(nvarchar(max), @CID) from Class where CID = @PCID)
	return @IDPath
end