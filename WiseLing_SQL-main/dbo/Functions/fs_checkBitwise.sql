create function fs_checkBitwise(@BitValue bigint, @BitPosition tinyint)
	returns bit
as
begin
	declare @Compare bigint = (power(convert(bigint, 2), @BitPosition))
	declare @Output bit = 0
	if ((select @BitValue & @Compare) = @Compare)
		set @Output = 1
	else
		set @Output = 0
	return @Output
end