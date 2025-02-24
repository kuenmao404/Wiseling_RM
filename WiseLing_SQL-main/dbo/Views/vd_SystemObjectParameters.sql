create   view vd_SystemObjectParameters as
select o.object_id, o.name, o.type, p.parameter_id, p.name 'parameter_name', p.is_output
from sys.objects o, sys.parameters p
where o.object_id = p.object_id  and o.type in ('FN', 'TF', 'P')