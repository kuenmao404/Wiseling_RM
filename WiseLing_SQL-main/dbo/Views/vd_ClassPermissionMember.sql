CREATE    view vd_ClassPermissionMember as
select [CID], V.[Type], [CName], V.Permission, V.PermissionBit, V.PermissionDes, v.RoleType , M.MID, M.Name, M.Account, M.SSOID, M.EMail
from vd_ClassPermission V, vs_Member M
where V.RoleType = 1 and V.RoleID = M.MID