CREATE   function fn_getClassPathFormEnd(@CID int, @nlevel int)
	returns @table table (
		namepath nvarchar(max), idpath nvarchar(max)
	)
as
begin
	declare @idpath nvarchar(max) = (select reverse(IDPath) from Class where CID = @CID)

	declare @tmp table (sno int , cid int, cname nvarchar(255))
	
	insert into @tmp
		select s.ordinal, c.cid, c.cname
		from string_split(@idpath, '/', 1) s, Class c
		where cast(reverse(s.value) as int) = c.CID and s.ordinal <=  @nlevel

	insert into @table
		select STRING_AGG(cname, '/') WITHIN GROUP (ORDER BY sno desc), STRING_AGG(cid, '/') WITHIN GROUP (ORDER BY sno desc)
		from @tmp

	return
end