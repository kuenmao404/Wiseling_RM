CREATE   procedure [dbo].[xp_insertVNoteBook]
	@vid int,
	@cname nvarchar(60),
	@mid int,
	@sid int,
	@status bit output,
	@message nvarchar(255) output,
	@cid int output
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try
		select @status = 0, @message = 'id不符', @cid = -1
		
		declare @cid_note int = (select CID from vd_ClassMemberNext where MID = @mid and type = 19)

		if (not exists(select * from vd_Video_Pub where vid = @vid) or @cid_note is null)begin
			return
		end

		exec xp_checkStringLimit @cname, 50, 0, '筆記本名稱', @status output, @message output
		if(@status = 0)
			return
		
		if exists(select * from vd_MemberClassNoteBook_New where ownerMID = @mid and vid = @vid and CName = @cname) begin
			select @status = 0, @message = '筆記本名稱重複'
			return
		end

		declare @cdes nvarchar(60) = @cname
		set @cname = @cname + '_' + cast(@vid as varchar) 


		begin transaction 
			
			declare @bDefault int = 1

			if exists(select * from vd_MemberClassNoteBook_New where ownerMID = @mid and vid = @vid)
				set @bDefault = 0

			exec xp_insertClass @cid_note, 19, @cname, @cdes, null, null, @mid, @cid output
				
			update Class set bHided = 1, cRank = @bDefault, ID = @vid where CID = @cid

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
end