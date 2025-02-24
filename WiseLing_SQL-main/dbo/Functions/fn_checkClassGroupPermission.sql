CREATE  function [dbo].[fn_checkClassGroupPermission](@cid int, @mid int, @permissionPos int, @myRole int, @targetRole int)
	returns bit
as
begin
	
	-- 檢查我有無這個class群組的@permissionPos權限
	-- 且檢查在相同群組內我的身分是否大於目標會員 (使用者在群組中的角色，目前有0 = Owner、1 = Manager，2 = 成員。Default = 2)
	return iif(dbo.fs_checkUserPermission(@cid, @mid, @permissionPos) = 0, 
				0, 
				iif(@myRole >= @targetRole, 0, 1))
end