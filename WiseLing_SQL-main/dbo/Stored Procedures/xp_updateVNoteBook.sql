CREATE   procedure [dbo].[xp_updateVNoteBook]
	@cid int,
	@vid int,
	@cname nvarchar(60),
	@hide bit,
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
		
		declare  @o_cname nvarchar(200) 
		
		select @o_cname = CName 
		from vd_MemberClassNoteBook_New 
		where ownerMID = @mid and VID = @vid and CID = @cid
		
		if (@o_cname is null) begin
			return
		end

		exec xp_checkStringLimit @cname, 50, 0, '筆記本名稱', @status output, @message output
		if(@status = 0)
			return
		
		if exists(select * from vd_MemberClassNoteBook_New where ownerMID = @mid and CID != @cid and CName = @cname and vid = @vid) begin
			select @status = 0, @message = '筆記本名稱重複'
			return
		end

		if(@hide is null)
			set @hide = 1

		declare @classCName nvarchar(255) = @cname + '_' + cast(@vid as varchar)

		begin transaction 
			if(@cname != @o_cname)begin
				exec xp_renameClass @cid, @classCName
				update Class set CDes = @cname where CID = @cid
			end

			update Class 
			set bHided = @hide
			where CID = @cid

			-- 公開
			if(@hide = 0) begin
				insert into Permission(CID, PermissionBits, RoleID, RoleType)
					select @cid, 3, g.GID, 0
					from Groups g
					where g.GName in ('Users', 'Guest') and 
					not exists(select * from Permission where CID = @cid and RoleType = 0 and RoleID = g.GID)
			end
			else begin

				delete Permission
				from  Groups g
				where Permission.CID = @cid and Permission.RoleID = g.GID 
					and Permission.RoleType = 0 and g.GName in ('Users', 'Guest')

			end

			select @status = 1, @message = '編輯成功' 

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