
CREATE   view vd_SystemObjectColumnSL as
select v.object_id, v.name, v.type, v.column_id, v.column_name, e.name 'extended_name', e.value 'ds_value'
from vd_SystemObjectColumn v
left join sys.extended_properties e
on v.object_id = e.major_id and v.column_id = e.minor_id and e.name = 'DS_SL_' + v.name + '_' + v.column_name