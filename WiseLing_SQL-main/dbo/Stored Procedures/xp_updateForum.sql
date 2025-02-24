CREATE   procedure [dbo].[xp_updateForum]
	@fid int,
	@title nvarchar(255),
	@text nvarchar(max),
	@mid int,
	@sid int,
	@status bit output,
	@message nvarchar(255) output
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try
		select @status = 0, @message = 'id不符'

		declare @nlevel int, @o_title nvarchar(255), @o_tid int, @bAllowNull bit

		select @nlevel = nlevel, @o_title = Title, @o_tid = TID, @bAllowNull = iif(bTitle = 0, 1, 0) 
		from Forum
		where MID = @mid and FID = @fid and bDel = 0

		if(@o_tid is null)
			return

		if(@nlevel > 1) begin
			select @title = null
		end

		exec xp_checkStringLimit @title, 200, @bAllowNull, '標題', @status output, @message output
		if(@status = 0)
			return

		exec xp_checkStringLimit @text, 8000, 0, '內文', @status output, @message output
		if(@status = 0)
			return

		declare @md5 nvarchar(32) = dbo.fs_getMD5Encode(@text)
		
		declare @tid int = (select tid from Text where MD5 = @md5) 

		begin transaction

			if(@tid is null) begin
				insert into Text(Text, MD5)
					values(@text, @md5)

				set @tid = SCOPE_IDENTITY()
			end

			declare @bUpdate bit = 0

			if(@o_tid != @tid or (@bAllowNull = 0 and @o_title != @title)) begin
				set @bUpdate = 1
			end

			update Forum 
			set bUpdate = @bUpdate, LastModifiedDT = iif(@bUpdate = 1, getdate(), LastModifiedDT), tid = @tid, title = @title 
			where FID = @fid

			set @status = 1
			set @message = '編輯成功'
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