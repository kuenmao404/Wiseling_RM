CREATE   function [dbo].[fn_getClassPCID](@cid int)
	returns int
as
begin
	declare @idpath nvarchar(max) = (select IDPath from class where cid = @cid)
	
	declare @pcid int = (
		select top 1 cast(value as int) 
		from string_split(@idpath, '/', 1) 
		where cast(value as int) != @cid
		order by ordinal desc
	)


	return @pcid
end