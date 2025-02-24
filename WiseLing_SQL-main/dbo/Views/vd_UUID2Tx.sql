CREATE view vd_UUID2Tx as
select U.UID, U.UUID, u.Des, T.MethodType, T.Name, T.TxType, T.PermissionType, T.CheckObject, T.RequiredCID
from  UUID2Tx U, Tx T
where U.UID = T.UID