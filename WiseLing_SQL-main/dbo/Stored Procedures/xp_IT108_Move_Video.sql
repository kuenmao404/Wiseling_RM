CREATE procedure [dbo].[xp_IT108_Move_Video]
as
begin
	set xact_abort on
	begin try

		drop table if exists #tmp_Move_video

		select *
		into #tmp_Move_video
		from IT108.EDU_Technology.dbo.vd_video v
		where not exists(select * from vd_Video_Pub p where v.videoid = p.videoID)

		drop table if exists #tmp_Move_channel
		select * 
		into #tmp_Move_channel
		from IT108.EDU_Technology.dbo.channel c
		where not exists(select * from Channel cc where c.id = cc.ChannelID)

	
		begin transaction 
			declare @oid int, @cname nvarchar(max), @cdes nvarchar(max), @path nvarchar(max),
					@videoid nvarchar(max), @channelTittle nvarchar(max), @channelID nvarchar(max), @channelDes nvarchar(max),
					@duration int

			while(exists (select * from #tmp_Move_channel)) begin
				select top 1 @channelTittle = Title, @channelID = ID, @channelDes = Des
				from #tmp_Move_channel

				insert into Channel (ChannelTitle, ChannelID, Des)
					values(@channelTittle, @channelID, @channelDes)

				delete #tmp_Move_channel where id = @channelID
			end


			declare @type int = (select EID from Entity where CName = '影片')

			while(exists (select * from #tmp_Move_video)) begin
				select top 1 @videoid = videoid, @cname = title, @cdes = content, @duration = duration,
								@channelID = channelID
				from #tmp_Move_video

				insert into Object (Type, CName, CDes)
					values(@type, @cname, @cdes)

				set @oid = SCOPE_IDENTITY()

				set @path = '/watch?v=' + @videoid

				declare @md5 binary(16) = HASHBYTES('MD5', 'https://www.youtube.com' + @path) 

				insert into URL(UID, Scheme, HostName, Path, MD5, MD5URL)
					values(@oid, 2, 'www.youtube.com', @path, @md5, @md5)

				declare @ChannelCID int = (select cid from Channel where ChannelID = @channelID)

				insert into Video(VID, VideoID, ChannelCID)
					values(@oid, @videoid, @ChannelCID)

				delete #tmp_Move_video where videoid = @videoid
			end
			
			
		commit transaction 
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction 
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