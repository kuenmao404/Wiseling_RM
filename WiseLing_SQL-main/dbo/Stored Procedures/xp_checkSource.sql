CREATE   procedure [dbo].[xp_checkSource]
	@pid int,
	@plid int,
	@contentType nvarchar(100),
	@fileExtension nvarchar(100),
	@time_limit int output,
	@mem_limit int output,
	@lang nvarchar(255) output,
	@status bit output,
	@message nvarchar(max) output
as
begin
	select @status = 0, @message = '錯誤'

	declare @allowFE nvarchar(255) 
	select @lang = name, @allowFE = fileExtension from vd_ProblemLang where pid = @pid and plid = @plid

	declare @allowContentType bit = 0
	
	if(@contentType = 'application/octet-stream' and  
		exists(
			select *
			from string_split(@allowFE, ',')
			where value = @fileExtension
		)
	) begin
		set @allowContentType = 1
	end
	
	if not exists(select * from vd_ProblemAll_Pub where pid = @pid) 
		set @message = 'id不符'
	else if(@lang is null) 
		set @message = '題目不允許該語言'
	else if(@allowContentType = 0 and @contentType is not null and not exists(select * from vd_PlangContentType where plid = @plid and contentType = @contentType))
		set @message = '不允許檔案類型' + @contentType
	else begin
		exec xp_insertContentType @contentType, @fileExtension, 0
		select @time_limit = time_limit, @mem_limit = mem_limit from vd_Problem where pid = @pid

		select @status = 1, @message = '格式與id正確'
	end
		
end