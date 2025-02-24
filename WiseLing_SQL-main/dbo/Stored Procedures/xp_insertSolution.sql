CREATE   procedure [dbo].[xp_insertSolution]
	@cid int, 
	@plid int,
	@code nvarchar(max),
	@mid int,
	@sid int
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try

		begin transaction　	
			declare @md5 nvarchar(32) = dbo.fs_getMD5Encode(@code)

			declare @solutionID int = (select SID from Solution where MD5 = @md5)

			if (@solutionID is null) begin
				insert into Solution(Text, MD5)
					values(@code, @md5)

				set @solutionID = SCOPE_IDENTITY()
			end

			declare @rank int = (select isnull(max(Rank) + 1, 0) from CSolution where CID = @cid and bDel = 0)

			insert into CSolution(CID, PLID, SID, OwnerMID, Rank)
				values(@cid, @plid, @solutionID, @mid, @rank)

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