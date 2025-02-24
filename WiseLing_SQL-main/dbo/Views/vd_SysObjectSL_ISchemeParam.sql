CREATE view vd_SysObjectSL_ISchemeParam as
select v.object_id, v.name, parameter_id 'ordinal', v.parameter_name 'param', DATA_TYPE 'type', PARAMETER_MODE 'mode', v.ds_value
from vd_SystemObjectParametersSL v, information_schema.PARAMETERS i 
where v.name = i.SPECIFIC_NAME 
and v.parameter_id = i.ORDINAL_POSITION and v.parameter_name = i.PARAMETER_NAME