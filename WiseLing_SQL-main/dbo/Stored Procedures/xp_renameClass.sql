CREATE  procedure [dbo].[xp_renameClass]
	@cid int,  
	@newcname nvarchar(255)
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	begin try
		begin transaction 
			
			update Class set NamePath = v.NamePath
			from fn_renameClass(@cid, @newcname) v
			where Class.CID = v.CCID

			update Class set CName = @newcname where CID = @cid
				
		commit transaction 
	end try
	begin catch
		if XACT_STATE() <> 0
		begin
			rollback transaction 
		end
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