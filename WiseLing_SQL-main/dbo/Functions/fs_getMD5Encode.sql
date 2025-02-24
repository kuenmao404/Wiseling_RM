create function fs_getMD5Encode(@String nvarchar(max))
	returns nvarchar(32)
as
begin
	return (select convert(nvarchar(32), hashbytes('MD5', @String),2))
end