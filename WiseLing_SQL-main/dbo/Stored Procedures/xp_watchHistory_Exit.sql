CREATE   procedure [dbo].[xp_watchHistory_Exit]
	@mid int,
	@vid int,
	@second int,
	@duration int,
	@sid int
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try

		declare @cid_watchlog int = (select CID from vd_ClassMemberNext where MID = @mid and CName = '觀看紀錄')

		if (not exists(select * from vd_Video_Pub where vid = @vid) or @cid_watchlog is null )begin
			return
		end

		-- 學習紀錄
		exec xp_History_New @mid, @vid, 18, 0, @duration, null, @sid

		begin transaction　[xp_watchHistory_Exit]
			declare @date date = getdate()

			update COHistory set ViewTime = @second where CID = @cid_watchlog and OID = @vid and Since = @date
			update CO set MG = @second where CID = @cid_watchlog and OID = @vid
			update OC set MG = @second where CID = @cid_watchlog and OID = @vid
			

		commit transaction	[xp_watchHistory_Exit]
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction [xp_watchHistory_Exit]
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