CREATE   procedure [dbo].[xp_deleteClass]
	@CID int
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	begin try
		begin transaction --下面的過程設定為一整筆交易動作
			delete CO where CID = @CID
			delete OC where CID = @CID
			delete Permission where CID = @CID
			delete Inheritance where CCID = @CID or PCID = @CID
			delete Class where CID = @CID
		commit transaction
	end try
	begin catch
		if XACT_STATE() <> 0
		begin
			rollback transaction
		end
		select
			ERROR_NUMBER() as ErrorNumber,
			ERROR_MESSAGE() as ErrorMessage
	end catch
	set xact_abort off
end