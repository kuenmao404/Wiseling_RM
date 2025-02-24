CREATE   procedure [dbo].[xp_updateMileStone]
	@cid int,
	@msid int,
	@date date,
	@content nvarchar(max),
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

		declare @ntid_o int = (select ContentNTID from MileStone where MSID = @msid and bDel = 0) 

		if(@ntid_o is null) begin
			return
		end

		declare @msid_d int, @bDel_d bit 
		
		select @msid_d = MSID, @bDel_d = bDel
		from MileStone 
		where date = @date

		if (@msid != @msid_d and @bDel_d = 0) begin
			set @message = '日期衝突，存在相同日期'
			return
		end

		if (@content is null or len(@content) = 0)begin
			set @message = '內容不為空'
			return
		end

		begin transaction　

			declare @md5 nvarchar(32) = dbo.fs_getMD5Encode(@content)

			declare @ntid int = (select ntid from NText where MD5 = @md5)

			if(@ntid is null) begin
				insert into NText(Text, MD5, Length)
					values(@content, @md5, len(@content))

				set @ntid = SCOPE_IDENTITY()
			end


			if(@msid_d is null) begin
				update MileStone 
				set LastModifiedDT = iif(@ntid != @ntid_o, getdate(), LastModifiedDT), ContentNTID = @ntid, Date = @date
				where MSID = @msid
			end
			else begin
				update MileStone 
				set bDel = 1
				where MSID = @msid

				update MileStone 
				set bDel = 0, Since = getdate(), LastModifiedDT = getdate(), ContentNTID = @ntid
				where MSID = @msid_d
			end


			select @status = 1, @message = '更新成功'
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