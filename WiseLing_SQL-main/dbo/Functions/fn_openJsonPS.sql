CREATE   function [dbo].[fn_openJsonPS](@pid int)
	returns @table table (
		sno int, value nvarchar(max)
	)
as
begin
	insert into @table
		select [key], value
		from openJson(
			(select PostString from PS where PID = @pid)
		)

	return 
end