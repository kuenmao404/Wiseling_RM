CREATE view vd_UUID2Tx_View as
select UUID, Name as vName, TxType, PermissionType, CheckObject, RequiredCID,
	iif(TxType = 0,
		(
			select COLUMN_Name 'name', DATA_TYPE 'type' 
			from INFORMATION_SCHEMA.Columns  
			where TABLE_NAME = Name and TABLE_SCHEMA = 'dbo'
			for json auto
		),
		(
			select ORDINAL_POSITION as 'Identity', PARAMETER_MODE 'Mode', PARAMETER_NAME 'Param', DATA_TYPE 'Type'
			from information_schema.PARAMETERS
			where SPECIFIC_NAME = Name and SPECIFIC_SCHEMA = 'dbo'
			order by ORDINAL_POSITION
			for json auto
		)
	) 'vParam'
from vd_UUID2Tx
where MethodType = 0