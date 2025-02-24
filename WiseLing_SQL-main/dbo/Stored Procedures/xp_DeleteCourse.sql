CREATE   procedure [dbo].[xp_deleteCourse]
	@cid int, 
	@courseName nvarchar(255),
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

		declare @o_cname nvarchar(255), @ownermid int 

		select @o_cname = courseName, @ownermid = ownermid from vd_Course 
		where cid = @cid

		if (@o_cname is null) begin
			return
		end

		if (@o_cname != @courseName) begin
			set @message = '名稱不符'
			return
		end

		if (@ownermid != @mid) begin
			set @message = '只有課程創建者能刪除課程'
			return
		end

		begin transaction　[xp_deleteCourse]

			-- tag 刪除
			update Tag set UseCount = UseCount - 1
			from CT
			where CT.CID = @cid and CT.TID = Tag.TID


			declare @delCName nvarchar(255) = @o_cname + '_' + cast(@cid as varchar)
			
			-- 課程名稱更改
			exec xp_renameClass @cid, @delCName

			update Class 
			set bDel = 1
			from fn_getChildClassWithParent(@cid) f
			where Class.CID = f.CCID
			

			select @status = 1, @message = '刪除成功'
		commit transaction	[xp_deleteCourse]
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction [xp_deleteCourse]
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