
CREATE view vd_UUID2TxSP
as
select UUID, t.Des, MethodType, '[' + [Name] + ']' AS 'Name', Name as 'Name2', PermissionType,
	(
	select ORDINAL_POSITION as 'Identity', PARAMETER_MODE 'Mode', PARAMETER_NAME 'Param', DATA_TYPE 'Type'
	from information_schema.PARAMETERS
	where SPECIFIC_NAME = T.Name and SPECIFIC_SCHEMA = 'dbo'
	order by ORDINAL_POSITION
	for json auto
	) 'param'
from  vd_UUID2Tx T
where t.TxType = 1