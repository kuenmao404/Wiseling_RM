CREATE   procedure [dbo].[xp_checkTestCase]
	@cid int, 
	@pid int,
	@tcid int,
	@datatype int, -- insert|delete|update (0|1|2)
	@status bit output,
	@message nvarchar(max) output
as
begin
	select @status = 0, @message = 'id不符'

	if(@datatype = 0 and not exists(select * from vd_ClassProblem where pid = @pid and cid = @cid and type = 30)) 
		return
	else if(@datatype = 1 and not exists(select * from vd_ClassProblemTestCase where cid = @cid and pid = @pid and tcid = @tcid))
		return
		
	select @status = 1, @message = '成'

end