CREATE   procedure [dbo].[xp_deleteNote]
	@vid int,
	@cid int,
	@nid int,
	@mid int,
	@sid int,
	@status bit output,
	@message nvarchar(max) output
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try
		select @status = 0, @message = 'id不符'

		if not exists(select * from vd_MemberNoteClass_Front where MID = @mid and CID = @cid and VID = @vid and nid = @nid) begin
			return
		end

		begin transaction　

			update Note set bDel = 1
			where NID = @nid and OwnerMID = @mid and VID = @vid

			update Class set nObject = (select count(*) from vd_MemberNoteClass_Front where mid = @mid and cid = @cid and vid = @vid)
			where CID = @cid

			exec xp_History_new @mid, @nid, 5, 1, null, null, @sid

			select @status = 1, @message = '刪除成功'
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