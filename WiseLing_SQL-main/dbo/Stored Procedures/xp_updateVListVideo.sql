CREATE procedure [dbo].[xp_updateVListVideo]
	@cid int, 
	@vid int,
	@rank int,
	@updateNotebookCID int,
	@mid int,
	@sid int,
	@status bit output,
	@message nvarchar(255) output
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	select @status = 0, @message = '錯誤'
	begin try
		
		declare @o_notebookcid int = (select cid from vd_VListVideo where ownerMID = @mid and vListCID = @cid and vid = @vid and rank = @rank) 

		if not exists(select * from vd_VListVideo where vListCID = @cid and ownerMID = @mid and vid = @vid and rank = @rank)
			set @message = 'ID不符'
		else if exists(select * from vd_VListVideo where vListCID = @cid and ownerMID = @mid and vid = @vid and cid = @updateNotebookCID and rank != @rank) 
			set @message = '已存在相同筆記本於清單內'
		else if (@updateNotebookCID is null and 
				exists(select * from vd_VListVideo where vListCID = @cid and ownerMID = @mid and vid = @vid and cid is null and rank != @rank) 
		)
			set @message = '已存在相同影片於清單內'
		else 
			select @status = 1, @message = ''
		
		if(@status = 0)
			return

		if(@o_notebookcid = @updateNotebookCID or (@o_notebookcid is null and @updateNotebookCID is null))
			return

		begin transaction 

			if(@o_notebookcid is null) begin
				delete CO where CID = @cid and OID = @vid
				delete OC where CID = @cid and OID = @vid

				insert into CRel(PCID, CCID, Rank)
					 values(@cid, @updateNotebookCID, @rank)
			end
			else if (@updateNotebookCID is not null and @o_notebookcid is not null) begin
				delete CRel where PCID = @cid and CCID = @o_notebookcid

				insert into CRel(PCID, CCID, Rank)
					 values(@cid, @updateNotebookCID, @rank)
			end
			else begin
				delete CRel where PCID = @cid and CCID = @o_notebookcid

				insert into CO(CID, OID, Rank)
					 values(@cid, @vid, @rank)
			end

			exec xp_History_New @mid, @cid, 34, 2, null, null, @sid

			select @status = 1, @message = '更改類型成功'
			
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