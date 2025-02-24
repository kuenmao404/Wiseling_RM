create function fs_getSHA2_512Encode(@String nvarchar(max))
	returns nvarchar(128)
as
begin
	return (select convert(nvarchar(128), hashbytes('SHA2_512', @String),2))
end