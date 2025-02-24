CREATE   function [dbo].[fn_getCIDPermission](@cid int, @mid int)
	returns @table table (
		S bit, M bit, [U] bit, [D] bit, [I] bit, [R] bit, [V] bit
	)
as
begin
	
	with tmp as(
		select p.PermissionBits & 64 'S', p.PermissionBits & 32 'M', p.PermissionBits & 16 'U',
				p.PermissionBits & 8 'D', p.PermissionBits & 4 'I', p.PermissionBits & 2 'R',
				p.PermissionBits & 1 'V'
		from Permission P, Groups G, GM
		where P.CID = @cid and p.RoleType = 0 and p.RoleID = g.GID and g.bDel = 0 and G.GID = gm.GID 
		and gm.Status = 1 and gm.MID = @mid
		union all
		select p.PermissionBits & 64 'S', p.PermissionBits & 32 'M', p.PermissionBits & 16 'U',
				p.PermissionBits & 8 'D', p.PermissionBits & 4 'I', p.PermissionBits & 2 'R',
				p.PermissionBits & 1 'V'
		from Permission P, Member M
		where P.CID = @cid and p.RoleType = 1 and p.RoleID = M.MID and M.MID = @mid
	)
	insert into @table
		select max([S]), max([M]), max([U]), max([D]), max([I]), max([R]), max([V])
		from tmp

	return
end