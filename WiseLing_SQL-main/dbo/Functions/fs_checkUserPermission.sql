create function fs_checkUserPermission(@CID int, @MID int, @BitPosition tinyint)
	returns bit
as
begin
	
	declare @Result bit = 0
	declare @Count int = (select count(*) from Permission where CID = @CID and RoleType = 1 and RoleID = @MID)
	if (@Count = 1)
	begin
		set @Result = (
			select dbo.fs_checkBitwise(PermissionBits, @BitPosition)
			from Permission where CID = @CID and RoleType = 1 and RoleID = @MID
		)
	end
	else
	begin
		declare @Sum int = 0
		set @Sum = (
			select	sum(convert(int, dbo.fs_checkBitwise(p.PermissionBits, @BitPosition)))
			from	Permission p, GM, Groups g
			where	p.CID = @CID and p.RoleType = 0 and p.RoleID = gm.GID and gm.MID = @MID and gm.GID = g.GID and g.bDel = 0 
		)
		if (@Sum > 0)
			set @Result = 1
	end

	return @Result
end