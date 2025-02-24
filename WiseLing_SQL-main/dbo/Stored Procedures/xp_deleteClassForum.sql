CREATE   procedure [dbo].[xp_deleteClassForum]
	@cid int,
	@pfid int,
	@fid int,
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

		declare @ownermid int, @nlevel int, @tag nvarchar(255),
			@bPermission bit = dbo.fs_checkUserPermission(@cid, @mid, 3)  -- 刪除權限
			
		select @ownermid = mid, @nlevel = nlevel, @tag = tag
		from vd_Forum 
		where fid = @fid

		declare @t table(TID int)

		-- tag相關
		insert into @t
			select TID from FT where FID = @fid
		
		-- 沒有權限且不是owner
		if(not ((@bPermission = 1 and @nlevel = 1) or @ownermid = @mid))
			return

		if(@pfid is null and not exists(select * from CF where CID = @cid and FID = @fid))
			return

		if(@pfid is not null and not exists(select * from vd_ClassForumChild where cid = @cid and pfid = @pfid and fid = @fid))
			return

		exec xp_deleteForum @pfid, @fid, @mid, @sid, @status output, @message output

		if(@tag is not null) begin
			begin transaction
				update Tag
				set nF = (select count(*) from vd_TF TF where TF.TID = Tag.TID)
				from @t t
				where Tag.TID = t.TID

			commit transaction	
		end

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