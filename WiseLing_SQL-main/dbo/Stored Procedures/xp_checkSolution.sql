CREATE   procedure [dbo].[xp_checkSolution]
	@cid int, 
	@plid int,
	@pid int,
	@contentType nvarchar(100),
	@fileExtension nvarchar(100),
	@lang nvarchar(255) output,
	@status bit output,
	@message nvarchar(max) output
as
begin
	select @status = 0, @message = '錯誤'

	if not exists(select * from vd_ClassProblem where pid = @pid and cid = @cid and type = 31) 
		set @message = 'id不符'
	else 
		exec xp_checkSource @pid, @plid, @contentType, @fileExtension, 0, 0, @lang output, @status output, @message output
		
end