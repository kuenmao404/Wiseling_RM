CREATE   procedure [dbo].[xp_deleteVListDocument]
	@cid int,
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
		
		set @message = 'ID不符'

		declare @vlistRootCID int = (select CID from vd_ClassMemberNext where Type = 34 and MID = @mid), 
				@o_vlistName nvarchar(max),
				@pcid int = [dbo].[fn_getClassPCID](@cid)
		


		select @o_vlistName = vListName
		from vd_VListNew
		where cid = @cid and ownerMID = @mid

		if(@o_vlistName is null)
			return
		else if(@cid = @vlistRootCID) begin
			set @message = '根目錄無法刪除'
			return
		end

		set @o_vlistName = @o_vlistName + '_' + cast(@cid as varchar)

		begin transaction　
			
			exec xp_renameClass @cid, @o_vlistName
			
			update class
			set bDel = 1
			from fn_getChildClassWithParent(@cid) f
			where f.CCID = Class.CID

			declare @nO int = (select count(*) from vd_VListNewSubClass where ownerMID = @mid and pcid = @pcid) +
						(select count(*) from vd_VListVideo where vListCID = @pcid and ownerMID = @mid)

			update Class 
			set nObject = @nO, LastModifiedDT = getdate()
			where CID = @pcid
			
			exec xp_History_New @mid, @cid, 34, 1, null, null, @sid

			set @status = 1
			set @message = '刪除影片收藏清單成功'
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