﻿CREATE   procedure [dbo].[xp_deletetPList]
	@cid int,
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

		declare @cname nvarchar(255) = (select vListName from vd_MemberClassPList where mid = @mid and cid = @cid)

		declare @cid_root int = (
			select CID
			from vd_ClassMemberNext 
			where MID = @mid and CName = '隨選播放清單'
		)

		if (@cname is null or @cid_root is null)
			return

		set @cname = @cname + '_' +  cast(@cid as varchar)

		
		begin transaction　[xp_deletetPList]

			exec xp_renameClass @cid, @cname

			update Class set bDel = 1 
			from fn_getChildClassWithParent(@cid) f
			where Class.CID = f.CCID

			update Class set nObject = (select count(*) from vd_MemberClassPList where mid = @mid)
			where CID = @cid_root

			exec xp_History_New @mid, @cid, 15, 1, null, null, @sid

			set @status = 1
			set @message = '刪除隨選播放清單成功'
		commit transaction	[xp_deletetPList]
		--登入新增新的一筆MSession
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction [xp_deletetPList]
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