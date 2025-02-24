CREATE  procedure [dbo].[xp_checkSolveProblem]	
	@pid int,
	@plid int,
	@contentType nvarchar(100),
	@fileExtension nvarchar(100),
	@mid int,
	@time_limit int output,
	@mem_limit int output,
	@lang nvarchar(max) output,
	@status bit output,
	@message nvarchar(max) output
as
begin
	select @status = 0, @message = '錯誤', @time_limit = -1, @mem_limit = -1

	declare @cid int = (select cid from vd_ClassMemberNext where MID = @mid and type = 32)

	declare @cid_p int = (select cid from vd_ClassProblem where type = 32 and pid = @pid)

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
	

	if(@cid is null or @cid_p is null)
		set @message = 'id不符'
	else if(@lang is null) 
		set @message = '題目不允許該語言'
	else if(@allowContentType = 0 and @contentType is not null and not exists(select * from vd_PlangContentType where plid = @plid and contentType = @contentType))
	begin
		set @message = '不允許檔案類型' + @contentType
	end
	else begin
		select @time_limit = time_limit, @mem_limit = mem_limit from vd_Problem where pid = @pid

		exec xp_insertContentType @contentType, @fileExtension, 0
	
		select @status = 1, @message = '成功'
	end
	
end