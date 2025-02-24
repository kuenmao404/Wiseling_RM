CREATE   procedure [dbo].[xp_insertTestCase]
	@cid int,
	@pid int,
	@tid int,
	@input  NVARCHAR (MAX) NULL,
	@output  NVARCHAR (MAX) NULL,
	@in_md5  NVARCHAR (32)  NULL,
	@out_md5 NVARCHAR (32)  NULL,
	@mid int,
	@sid int
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try

		begin transaction　	
			insert into TestCase(TCID, Input, Output, In_md5, Out_md5, OwnerMID)
				values(@tid, @input, @output, @in_md5, @out_md5, @mid)

			declare @seq int = (select isnull(max(rank) + 1, 0) from vd_ClassProblemTestCase where pid = @pid and cid = @cid)
			
			insert into CTC(CID, TCID, Rank)
				values(@cid, @tid, @seq)

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