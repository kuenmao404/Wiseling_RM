create   view vd_SystemObjectColumn as
select o.object_id, o.name, o.type, p.column_id, p.name 'column_name'
from sys.objects o, sys.all_columns p
where o.object_id = p.object_id and o.type in ('V', 'U')