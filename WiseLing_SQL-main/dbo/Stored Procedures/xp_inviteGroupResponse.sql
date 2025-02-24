create   procedure [dbo].[xp_inviteGroupResponse]
	@iid int,
	@status bit,
	@sid int
as
begin
	set xact_abort on 
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try
		
		begin transaction　[xp_inviteGroupResponse]
			
			update InviteHistory set SendEMailOK = @status where IID = @iid
			
		commit transaction	[xp_inviteGroupResponse]
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction [xp_inviteGroupResponse]
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