CREATE   procedure [dbo].[xp_insertForum]
	@fid int,
	@title nvarchar(255),
	@bTitleAllowNull bit = 1,
	@text nvarchar(max),
	@mid int,
	@sid int,
	@fid_out int output,
	@status bit output,
	@message nvarchar(255) output
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try
		select @status = 0, @message = 'id不符'


		declare @nlevel int = 1

		if(@fid is not null) begin
			select @nlevel = 2, @title = null, @bTitleAllowNull = 1
			if not exists(select * from vd_Forum where fid = @fid)
				return
		end

		exec xp_checkStringLimit @title, 200, @bTitleAllowNull, '標題', @status output, @message output
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

			insert into Forum(TID, MID, nlevel, Title, bTitle)
				values(@tid, @mid, @nlevel, @title, iif(@bTitleAllowNull = 1, 0, 1))

			set @fid_out = SCOPE_IDENTITY()

			if(@fid is not null) begin
				insert into ForumRel(FID1, FID2)
					values(@fid, @fid_out)

				update Forum set nC = (
						select count(*) 
						from ForumRel R, Forum F
						where R.FID1 = @fid and r.FID2 = f.FID and f.bDel = 0
					)
				where FID = @fid
			end


			set @status = 1
			set @message = '新增成功'
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
end