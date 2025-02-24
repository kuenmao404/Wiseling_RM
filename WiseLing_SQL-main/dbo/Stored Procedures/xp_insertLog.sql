CREATE  procedure [dbo].[xp_insertLog]
	@sid int,
	@dop bit,
	@pos nvarchar(max),
	@aid int,
	@method nvarchar(max)
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	begin try

		if not exists(select * from MSession where SID = @sid) begin
			return
		end

		begin transaction　

			insert into PS(PostString)
				values(@pos)

			declare @pid int = scope_identity()
			
			insert into LogManTx(SID, Method, PID, DataOperation, AID)
				values(@sid, @method, @pid, @dop, @aid)

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
GO
EXECUTE sp_addextendedproperty @name = N'DS_SL_xp_insertLog_@sid', @value = N'', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'PROCEDURE', @level1name = N'xp_insertLog', @level2type = N'PARAMETER', @level2name = N'@sid';


GO
EXECUTE sp_addextendedproperty @name = N'DS_SL_xp_insertLog_@pos', @value = N'', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'PROCEDURE', @level1name = N'xp_insertLog', @level2type = N'PARAMETER', @level2name = N'@pos';


GO
EXECUTE sp_addextendedproperty @name = N'DS_SL_xp_insertLog_@method', @value = N'', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'PROCEDURE', @level1name = N'xp_insertLog', @level2type = N'PARAMETER', @level2name = N'@method';


GO
EXECUTE sp_addextendedproperty @name = N'DS_SL_xp_insertLog_@dop', @value = N'', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'PROCEDURE', @level1name = N'xp_insertLog', @level2type = N'PARAMETER', @level2name = N'@dop';


GO
EXECUTE sp_addextendedproperty @name = N'DS_SL_xp_insertLog_@aid', @value = N'', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'PROCEDURE', @level1name = N'xp_insertLog', @level2type = N'PARAMETER', @level2name = N'@aid';

