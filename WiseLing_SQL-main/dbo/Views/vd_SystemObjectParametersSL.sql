
CREATE   view vd_SystemObjectParametersSL as
select v.object_id, v.name, v.type, v.parameter_id, v.parameter_name, v.is_output, e.name 'extended_name', e.value 'ds_value'
from vd_SystemObjectParameters v
left join sys.extended_properties e
on v.object_id = e.major_id and v.parameter_id = e.minor_id and e.name = 'DS_SL_' + v.name + '_' + v.parameter_name