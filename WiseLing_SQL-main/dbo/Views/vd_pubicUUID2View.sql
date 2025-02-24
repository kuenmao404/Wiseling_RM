CREATE view vd_pubicUUID2View as
select UUID, vName , pvName, CheckObject, RequiredCID,
(
	select COLUMN_Name 'name', DATA_TYPE 'type' 
	from INFORMATION_SCHEMA.Columns  
	where TABLE_NAME = vName and TABLE_SCHEMA = 'dbo' for json auto
) 'vParam',
(
	select COLUMN_Name 'name', DATA_TYPE 'type' 
	from INFORMATION_SCHEMA.Columns  
	where TABLE_NAME = pvName and TABLE_SCHEMA = 'dbo' for json auto
) 'pvParam'
from UUID2View
where pvName is not null
GO
EXECUTE sp_addextendedproperty @name = N'DS_vd_pubicUUID2View_vparam', @value = N'權限view欄位資訊', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'vd_pubicUUID2View', @level2type = N'COLUMN', @level2name = N'vParam';


GO
EXECUTE sp_addextendedproperty @name = N'DS_vd_pubicUUID2View_CheckObject', @value = N'null|0|1 → view表無Object|有Object，判斷R權限|有Object且hide需判斷M權限', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'vd_pubicUUID2View', @level2type = N'COLUMN', @level2name = N'CheckObject';


GO
EXECUTE sp_addextendedproperty @name = N'DS_vd_pubicUUID2View_pvName', @value = N'public view', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'vd_pubicUUID2View', @level2type = N'COLUMN', @level2name = N'pvName';


GO
EXECUTE sp_addextendedproperty @name = N'DS_vd_pubicUUID2View_vName', @value = N'需權限驗證view', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'vd_pubicUUID2View', @level2type = N'COLUMN', @level2name = N'vName';


GO
EXECUTE sp_addextendedproperty @name = N'DS_vd_pubicUUID2View_UUID', @value = N'', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'vd_pubicUUID2View', @level2type = N'COLUMN', @level2name = N'UUID';


GO
EXECUTE sp_addextendedproperty @name = N'DS_vd_pubicUUID2View_', @value = N'查看view表欄位 (用於API)', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'vd_pubicUUID2View';

