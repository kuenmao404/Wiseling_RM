CREATE   procedure [dbo].[xp_insertLogErr]
	@sid int,
	@errmsg nvarchar(900),
	@errcode int,
	@aid int
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	begin try
		begin transaction 
			insert into LogError(SID, ErrMsg, ErrCode, AID)
				values(@sid, @errmsg, @errcode, @aid)		
		commit transaction 
				
	end try
	begin catch
		if XACT_STATE() <> 0
		begin
			rollback transaction 
		end
		declare @errmsgm nvarchar(max) = ERROR_MESSAGE()
		select
			ERROR_NUMBER() as ErrorNumber,
			@errmsgm as ErrorMessage
		raiserror(@errmsgm, 18, 1)
	end catch
	set xact_abort off
end