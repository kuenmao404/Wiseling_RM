CREATE   view vd_SystemObjectAllSL as
select object_id, name, type, column_id, column_name, extended_name, ds_value
from vd_SystemObjectColumnSL
union all
select object_id, name, type, parameter_id as column_id, parameter_name as column_name, extended_name, ds_value
from vd_SystemObjectParametersSL