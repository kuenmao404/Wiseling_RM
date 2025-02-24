CREATE function fn_formatBracket(@String nvarchar(max))
	returns nvarchar(max)
as
begin
	declare @s nvarchar(max) = ''

	select @s = @s + ss.value
	from string_split(@String, '(', 1) s
	cross apply string_split(s.value, ')', 1) ss
	where (s.ordinal = 1 and ss.ordinal = 1) or ss.ordinal != 1


	
	return @s
end