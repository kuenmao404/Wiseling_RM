CREATE   procedure [dbo].[xp_History_Watch]
	@mid int,
	@hid int,
	@type int,
	@date date
	--Type → 18|5|16|17|14|15 
	--(影片|筆記|影片按讚|筆記按讚|影片收藏清單|隨選播放清單)
	--Datetype → 0|1|2 (I|D|U)
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	begin try
		if(@type != 18)
			return
		begin transaction　

			-- 會員觀看紀錄馬賽克專
			declare @cid_watch int = (select CID from vd_ClassMemberNext where MID = @mid and type = 27)
			declare @mapID_watch int = (select MapID from CalendarHeatMap where CID = @cid_watch and Date = @date)

			if(@mapID_watch is null) begin
				insert into CalendarHeatMap (CID, Date)
					values(@cid_watch, @date)

				set @mapID_watch = SCOPE_IDENTITY()
			end

			insert into MapH(MapID, HID)
				values(@mapID_watch, @hid)

			update CalendarHeatMap set nC = (select count(*) from vd_CalendarHeatMap_sys h where h.mapID = @mapID_watch and bDel = 0)
			where MapID = @mapID_watch
			
			
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
end