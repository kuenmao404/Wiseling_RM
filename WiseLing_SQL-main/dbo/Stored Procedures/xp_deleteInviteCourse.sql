CREATE procedure [dbo].[xp_deleteInviteCourse]
	@iid int,
	@courseCID int,
	@cid int,
	@mid int,
	@sid int,
	@status bit output,
	@message nvarchar(255) output
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try
		select @status = 0, @message = 'id不符'
		
		if not exists(select * from InviteHistory where iid = @iid and CourseCID = @courseCID and GroupCID = @cid)
			return

		if not exists(select * from vd_CourseClassGroup where PCID = @courseCID and CID = @cid)
			return

		begin transaction [xp_deleteInviteCourse]
			
			update InviteHistory set bDel = 1 where IID = @iid

			select @status = 1, @message = '刪除成功'
			
		commit transaction [xp_deleteInviteCourse]
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction [xp_deleteInviteCourse]
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