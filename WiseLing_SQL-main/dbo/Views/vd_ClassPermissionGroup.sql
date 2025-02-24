CREATE    view vd_ClassPermissionGroup as
select [CID], V.[Type], [CName], V.Permission, V.PermissionBit, V.PermissionDes, v.RoleType , G.GID, G.GName, G.GDes, [CDes], [EName], [EDes], [IDPath], [NamePath], V.[Since], [LastModifiedDT], [nObject], [cRank], [oRank], [nLevel], [nClick], [Keywords], [OwnerMID], v.[bHided], v.[bDel]
from vd_ClassPermission V, Groups G
where V.RoleType = 0 and V.RoleID = G.GID