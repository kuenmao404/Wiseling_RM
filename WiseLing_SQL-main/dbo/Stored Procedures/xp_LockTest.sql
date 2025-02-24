CREATE   procedure [dbo].[xp_LockTest]
	@session nvarchar(max)
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	begin try

		select @session as session, convert(time, getdate()) as strtTime

		begin transaction　

			select @session as session, 'before' as status, 1 as nlevel, convert(time, getdate()) as since

			begin transaction　
				declare @v int;
				exec @v = sp_getapplock @Resource = 'test', @LockMode='Exclusive'

				select @session as session, 'before' as status, 1 as nlevel, @v as output, convert(time, getdate()) as since

				waitfor delay '00:00:04'

				select @session as session, 'aflter' as status, @v as output, convert(time, getdate()) as since
			commit transaction	
			
			select @session as session, 'aflter' as status, 1 as nlevel, 1 as nlevel, convert(time, getdate()) as since

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
		RAISERROR( @ErrorMessage, @ErrorSeverity, @ErrorState);--回傳錯誤資訊
	end catch
	set xact_abort off
end