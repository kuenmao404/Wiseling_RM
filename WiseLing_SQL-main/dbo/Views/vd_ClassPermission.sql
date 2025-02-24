create    view vd_ClassPermission as
select C.[CID], C.[Type], [CName], V.Permission, V.PermissionBit, V.PermissionDes ,[CDes], [EName], [EDes], [IDPath], [NamePath], C.[Since], [LastModifiedDT], [nObject], [cRank], [oRank], [nLevel], [nClick], [Keywords], [OwnerMID], C.[bHided], C.[bDel], P.RoleID, P.RoleType
from Class C, Permission P
cross apply fn_getPermissionDes(P.PermissionBits) V
where C.CID = P.CID