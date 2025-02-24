CREATE   procedure [dbo].[xp_insertMileStone]
	@cid int,
	@content nvarchar(max),
	@date date,
	@sid int,
	@status bit output,
	@message nvarchar(max) output
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try
		
		select @status = 0, @message = 'ID不符'

		if not exists(select * from vd_RootNext where type = 26 and CID = @cid)
			return

		if (@content is null or len(@content) = 0)begin
			set @message = '內容不為空'
			return
		end

		if(@date is null)
			set @date = getdate()

		begin transaction　

			declare @md5 nvarchar(32) = dbo.fs_getMD5Encode(@content)

			declare @ntid int = (select ntid from NText where MD5 = @md5)

			if(@ntid is null) begin
				insert into NText(Text, MD5, Length)
					values(@content, @md5, len(@content))

				set @ntid = SCOPE_IDENTITY()
			end

			if exists(select * from MileStone where date = @date) begin
				update MileStone 
				set LastModifiedDT = getdate(), since = getdate(), ContentNTID = @ntid, bDel = 0
				where date = @date
			end
			else begin
				insert into MileStone(ContentNTID, Date)
					values(@ntid, @date)
			end

			select @status = 1, @message = '新增成功'
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