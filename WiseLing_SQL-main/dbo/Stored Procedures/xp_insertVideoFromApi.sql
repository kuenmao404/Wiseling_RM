CREATE procedure [dbo].[xp_insertVideoFromApi]
	@videoID nvarchar(50),
	@title nvarchar(255),
	@description nvarchar(max),
	@channelTitle nvarchar(255),
	@channelID nvarchar(255),
	@publishedAt datetime,
	@categoryID nvarchar(10),
	@duration int,
	@sid int,
	@vid int output
as
begin
	set xact_abort on
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try
		
		set @vid = (select VID from Video where VideoID = @videoID)

		declare @eid int = (select EID from Entity where CName = '影片')

		begin transaction [xp_insertVideoFromApi]

			if(@vid is null) begin
				declare @channelCID int = (select CID from Channel where ChannelID = @channelId)

				insert into Object(Type, CName, Since)
					values(@eid, @title, @publishedAt)

				set @vid = scope_identity()

				declare @md5 binary(16) = HASHBYTES('MD5', 'https://www.youtube.com/watch?v=' + @videoID) 

				insert into URL(UID, Scheme, HostName, Path, MD5, MD5URL)
					values(@vid, 2, 'www.youtube.com', '/watch?v=' + @videoID, @md5, @md5)

				if (@channelCID is null) begin
					insert into Channel(ChannelID, ChannelTitle)
						values(@channelId, @channelTitle)

					set @channelCID = scope_identity()
				end

				insert into Video(VID, VideoID, DesLong, Duration, CategoryID, ChannelCID)
					values(@vid, @videoID, @description, @duration, @categoryID, @channelCID)
				 
			end
			else begin
				update Object set CName = @title where OID = @vid

				update Video 
				set DesLong = @description, Duration = isnull(@duration, Duration), CategoryID = isnull(@categoryID, CategoryID)
				where VID = @vid

			end

		commit transaction [xp_insertVideoFromApi]
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction [xp_insertVideoFromApi]
		declare @ErrorMessage As VARCHAR(1000) = CHAR(10)+'錯誤代碼：' +CAST(ERROR_NUMBER() AS VARCHAR)
										+CHAR(10)+'錯誤訊息：'+	ERROR_MESSAGE()
										+CHAR(10)+'錯誤行號：'+	CAST(ERROR_LINE() AS VARCHAR)
										+CHAR(10)+'錯誤程序名稱：'+	ISNULL(ERROR_PROCEDURE(),'')
		declare @ErrorSeverity As Numeric = ERROR_SEVERITY()
		declare @ErrorState As Numeric = ERROR_STATE()
		declare @err_number int = ERROR_NUMBER()
		exec xp_insertLogErr @sid, @ErrorMessage, @err_number, @aid
		RAISERROR( @ErrorMessage, @ErrorSeverity, @ErrorState);--回傳錯誤資訊
	end catch
	set xact_abort off
end