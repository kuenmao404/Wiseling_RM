CREATE procedure [dbo].[xp_updateVListParagraph]
	@cid int, 
	@paragraphCID int,
	@paragraphName nvarchar(200),
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


		declare @paragraphName_o nvarchar(255) = (
			select paragraphName 
			from vd_VListParagraph where cid = @cid and paragraphCID = @paragraphCID
		)

		if(@paragraphName_o is null) begin
			return
		end

		if exists(select * from vd_VListParagraph where cid = @cid and paragraphName = @paragraphName and paragraphCID != paragraphCID) begin
			set @message = '已存在相同段落名稱於這個清單內'
			return
		end

		if(@paragraphName is null or len(@paragraphName) = 0) begin
			set @message = '段落名稱不為空'
			return
		end

		begin transaction [xp_updateVListParagraph]

			if(@paragraphName != @paragraphName_o)begin
				exec xp_renameClass @paragraphCID, @paragraphName

				update Class set LastModifiedDT = getdate() where CID = @cid
			end

			exec xp_History_New @mid, @cid, 14, 2, null, null, @sid

			select @status = 1, @message = '成功編輯段落'
			
		commit transaction [xp_updateVListParagraph]
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction [xp_updateVListParagraph]
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