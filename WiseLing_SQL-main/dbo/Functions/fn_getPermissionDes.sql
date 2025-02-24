CREATE    function [dbo].[fn_getPermissionDes](@permission int)
	returns @table table (
		Permission int, PermissionBit nvarchar(max), PermissionDes nvarchar(max)
	)
as
begin
	insert into @table
	select @permission as Permission
		, STRING_AGG(IIF(PermissionBits & @permission > 0, 1, 0), '')
		, STRING_AGG(IIF(PermissionBits & @permission > 0, PermissionDes, null), '|') 
	from (values (64, '訂閱'), (32, '管理'), (16, '修改'), (8, '刪除'), (4, '新增'), (2, '讀取'), (1, '看')	
	) as permission(PermissionBits, PermissionDes)


	return
end
GO
EXECUTE sp_addextendedproperty @name = N'DS_SL_fn_getPermissionDes_@permission', @value = N'0', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'FUNCTION', @level1name = N'fn_getPermissionDes', @level2type = N'PARAMETER', @level2name = N'@permission';

