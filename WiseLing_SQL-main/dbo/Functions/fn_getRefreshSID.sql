CREATE   function fn_getRefreshSID(@access uniqueidentifier, @refress uniqueidentifier)
	returns int
as
begin
	declare @sid int 
	-- 換發憑證
	if(@access is null or exists(select * from MSession where AccessToken = @access and getdate() > ExpiredDT)) begin
		set @sid = (select SID from MSession where RefreshToken = @refress)
	end

	return @sid
end