
CREATE view vd_PublicUUID2SP as
select UUID,  SPName, 
	(
		select *
		from information_schema.PARAMETERS
		where SPECIFIC_NAME = SPName and SPECIFIC_SCHEMA = 'dbo'
		order by ORDINAL_POSITION
		for json auto
	) as Param
from UUID2PublicSP