CREATE   procedure [xp_checkStringLimit]
	@s nvarchar(max),
	@limit int, 
	@bAllowNull bit,
	@text nvarchar(255),
	@status bit output,
	@message nvarchar(255) output
as
begin
	select @status = 1, @message = ''

	if(@bAllowNull = 0 and (@s is null or len(@s) = 0))
		select @status = 0, @message = @text + '不為空'
	else if(len(@s) > @limit) 
		select @status = 0, @message = @text + '超過長度限制' + cast(@limit as varchar) + '個字'
	



end