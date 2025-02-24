CREATE   procedure [dbo].[xp_LockTest_Buffer]
	@session nvarchar(max)
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	begin try

		-- 紀錄進入時間
		select @session as session, convert(time, getdate()) as startTime

		begin transaction　
			
			-- lock
			declare @v int;
			exec @v = sp_getapplock @Resource = 'test', @LockMode='Exclusive'

			-- 紀錄等待後執行時間
			select @session as session, 'before' as status, @v as output, convert(time, getdate()) as since

			-- 模擬換證，若有BufferDT且在時間內則釋放lock
			if((select top 1 bBuffer from tmp) = 1)begin
				exec sp_releaseapplock @Resource = 'test';
				select '於BufferDT時間內，無需在換證' as message
			end
			-- 需進行換證，模擬換證設BufferDT
			else begin
				update tmp set bBuffer = 1
				select '換證並設BufferDT' as message
			end

			-- 模擬執行時間，4秒
			waitfor delay '00:00:04'

			-- 紀錄結束時間
			select @session as session, 'aflter' as status, @v as output, convert(time, getdate()) as since

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