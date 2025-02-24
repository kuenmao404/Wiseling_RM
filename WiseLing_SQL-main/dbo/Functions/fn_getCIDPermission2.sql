CREATE   function [dbo].[fn_getCIDPermission2](@cid int, @mid int)
	returns @table table (
		Subscribe bit, Manage bit, [Update] bit, [Delete] bit, [Insert] bit, [Read] bit, [View] bit
	)
as
begin
	
	with tmp as(
		select p.PermissionBits & 64 'Subscribe', p.PermissionBits & 32 'Manage', p.PermissionBits & 16 'Update',
				p.PermissionBits & 8 'Delete', p.PermissionBits & 4 'Insert', p.PermissionBits & 2 'Read',
				p.PermissionBits & 1 'View'
		from Permission P, Groups G, GM
		where P.CID = @cid and p.RoleType = 0 and p.RoleID = g.GID and g.bDel = 0 and G.GID = gm.GID 
		and gm.Status = 1 and gm.MID = @mid
		union all
		select p.PermissionBits & 64 'Subscribe', p.PermissionBits & 32 'Manage', p.PermissionBits & 16 'Update',
				p.PermissionBits & 8 'Delete', p.PermissionBits & 4 'Insert', p.PermissionBits & 2 'Read',
				p.PermissionBits & 1 'View'
		from Permission P, Member M
		where P.CID = @cid and p.RoleType = 1 and p.RoleID = M.MID and M.MID = @mid
	)
	insert into @table
		select max([Subscribe]), max([Manage]), max([Update]), max([Delete]), max([Insert]), max([Read]), max([View])
		from tmp

	return
end