CREATE   procedure [dbo].[xp_insertPListNote]
	@cid int,
	@nid int,
	@mid int,
	@sid int,
	@status bit output,
	@message nvarchar(255) output
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try
		select @status = 0, @message = 'ID不符'

		if not exists(select * from vd_PList where cid = @cid)begin
			return
		end

		if exists(select * from vd_PListNote where cid = @cid and nid = @nid) begin
			set @message = '已存在相同筆記於清單內'
			return
		end

		declare @seq int = (select isnull(max(rank) + 1, 0) from vd_PListNote where cid = @cid)

		begin transaction　
			
			insert into CN(CID, NID, Rank)
				values(@cid, @nid, @seq)

			insert into NC(CID, NID)
				values(@cid, @nid)

			update Class set nObject = (select count(*) from vd_PListNote where cid = @cid)
			where CID = @cid


			exec xp_History_New @mid, @cid, 15, 2, null, null, @sid

			set @status = 1
			set @message = '新增隨選播放清單內筆記成功'
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
	set xact_abort off
end