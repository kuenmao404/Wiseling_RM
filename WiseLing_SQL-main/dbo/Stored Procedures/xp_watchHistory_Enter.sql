CREATE   procedure [dbo].[xp_watchHistory_Enter]
	@mid int,
	@vid int,
	@sid int
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try

		
		declare @cid_watchlog int = (select CID from vd_ClassMemberNext where MID = @mid and type = 27)

		if (not exists(select * from vd_Video_Pub where vid = @vid) or @cid_watchlog is null)begin
			return
		end

		-- 學習紀錄
		exec xp_History_new @mid, @vid, 18, 0, 0, null, @sid

		begin transaction 

			-- 會員影片點擊紀錄
			update Object 
			set nClick = nClick + 1
			where OID = @vid

			declare @now datetime = getdate()

			-- 會員有無看過影片，最後觀看時間
			if not exists(select * from CO where CID = @cid_watchlog and OID = @vid) begin
				insert into CO(CID, OID)
					values(@cid_watchlog, @vid)

				insert into OC(CID, OID)
					values(@cid_watchlog, @vid)

			end
			else begin
				update CO set Since = @now where CID = @cid_watchlog and OID = @vid
				update OC set Since = @now where CID = @cid_watchlog and OID = @vid
			end 

			-- 使用Msession紀錄影片觀看次數
			if not exists(select * from COLog where CID = @cid_watchlog and OID = @vid and SID = @sid) begin
				insert into COLog(CID, OID, SID, Since)
					values(@cid_watchlog, @vid, @sid, @now)

				update Video 
				set ViewCount = ViewCount + 1
				where VID = @vid
				
			end
			else begin
				update COLog set Since = @now where CID = @cid_watchlog and OID = @vid and SID = @sid
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
		exec xp_insertLogErr @sid, @ErrorMessage, @err_number, @aid
		RAISERROR( @ErrorMessage, @ErrorSeverity, @ErrorState);--回傳錯誤資訊
	end catch
end
GO
EXECUTE sp_addextendedproperty @name = N'DS_xp_watchHistory_Enter_@vid', @value = N'Video.VID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'PROCEDURE', @level1name = N'xp_watchHistory_Enter', @level2type = N'PARAMETER', @level2name = N'@vid';


GO
EXECUTE sp_addextendedproperty @name = N'DS_SL_xp_watchHistory_Enter_@vid', @value = N'0', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'PROCEDURE', @level1name = N'xp_watchHistory_Enter', @level2type = N'PARAMETER', @level2name = N'@vid';


GO
EXECUTE sp_addextendedproperty @name = N'DS_xp_watchHistory_Enter_@sid', @value = N'MSession.SID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'PROCEDURE', @level1name = N'xp_watchHistory_Enter', @level2type = N'PARAMETER', @level2name = N'@sid';


GO
EXECUTE sp_addextendedproperty @name = N'DS_SL_xp_watchHistory_Enter_@sid', @value = N'0', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'PROCEDURE', @level1name = N'xp_watchHistory_Enter', @level2type = N'PARAMETER', @level2name = N'@sid';




GO
EXECUTE sp_addextendedproperty @name = N'DS_xp_watchHistory_Enter_@mid', @value = N'會員', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'PROCEDURE', @level1name = N'xp_watchHistory_Enter', @level2type = N'PARAMETER', @level2name = N'@mid';


GO
EXECUTE sp_addextendedproperty @name = N'DS_SL_xp_watchHistory_Enter_@mid', @value = N'', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'PROCEDURE', @level1name = N'xp_watchHistory_Enter', @level2type = N'PARAMETER', @level2name = N'@mid';

