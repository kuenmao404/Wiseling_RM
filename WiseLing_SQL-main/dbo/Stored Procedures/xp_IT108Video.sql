CREATE procedure [dbo].[xp_IT108Video]
	@cname nvarchar(max),
	@cdes nvarchar(4000),
	@path nvarchar(max),
	@videoid nvarchar(max),
	@channelID nvarchar(max)
as
begin
	set xact_abort on
	begin try
		
		if exists( select * from Video where VideoID = @videoid)
		begin
			return
		end

		begin transaction [xp_IT108Video]
			declare @oid int

			insert into Object (Type, CName, CDes)
				values(1, @cname, @cdes)

			set @oid = SCOPE_IDENTITY()

			declare @md5 binary(16) = HASHBYTES('MD5', 'https://www.youtube.com' + @path) 

			insert into URL(UID, Scheme, HostName, Path, MD5, MD5URL)
				values(@oid, 2, 'www.youtube.com', @path, @md5, @md5)

			declare @ChannelCID int = (select cid from Channel where ChannelID = @channelID)

			insert into Video(VID, VideoID, ChannelCID)
				values(@oid, @videoid, @ChannelCID)
			
			
		commit transaction [xp_IT108Video]
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction [xp_IT108Video]
		declare @ErrorMessage As VARCHAR(1000) = CHAR(10)+'錯誤代碼：' +CAST(ERROR_NUMBER() AS VARCHAR)
										+CHAR(10)+'錯誤訊息：'+	ERROR_MESSAGE()
										+CHAR(10)+'錯誤行號：'+	CAST(ERROR_LINE() AS VARCHAR)
										+CHAR(10)+'錯誤程序名稱：'+	ISNULL(ERROR_PROCEDURE(),'')
		declare @ErrorSeverity As Numeric = ERROR_SEVERITY()
		declare @ErrorState As Numeric = ERROR_STATE()
		declare @err_number int = ERROR_NUMBER()
		RAISERROR( @ErrorMessage, @ErrorSeverity, @ErrorState);--回傳錯誤資訊
	end catch
	set xact_abort off
end