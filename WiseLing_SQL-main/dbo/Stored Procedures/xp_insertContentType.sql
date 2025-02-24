CREATE procedure [dbo].[xp_insertContentType]
	@ContentType nvarchar(100),
	@FileExtension nvarchar(100),
	@CTID int output
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	begin try
		declare @des nvarchar(255)

		select @CTID = CTID, @des = Des from ContentType  where Title = @ContentType

		begin transaction 
			
			if(@CTID is null)
			begin 
				insert into ContentType (Title)  values (@ContentType)
				set @CTID = SCOPE_IDENTITY() 
			end


			declare @tmp table(text nvarchar(50))

			insert into @tmp
				select value
				from string_split(@des,',')

			if not exists(select * from @tmp where text = @FileExtension) begin
				
				insert into @tmp(text) values(@FileExtension)

				;with t as(
					select STRING_AGG(text, ',') as des
					from @tmp 
				)
				update ContentType set Des = t.des
				from t
				where CTID = @CTID
			end

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
end