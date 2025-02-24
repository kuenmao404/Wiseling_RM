CREATE   procedure [dbo].[xp_updateVListDocument]
	@cid int,
	@vListName nvarchar(60),
	@vListDes nvarchar(4000),
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

		declare @vlistRootCID int, @hide_root bit, @o_vlistName nvarchar(max), @o_vListDes nvarchar(max),
				@pcid int = [dbo].[fn_getClassPCID](@cid)

		select @o_vlistName = vListName, @o_vListDes = vListDes
		from vd_VListNew
		where cid = @cid and ownerMID = @mid

		if(@o_vlistName is null)
			return

		exec xp_checkStringLimit @vListName, 50, 0, '收藏目錄名稱', @status output, @message output
		if(@status = 0)
			return
		
		exec xp_checkStringLimit @vListDes, 3500, 1, '收藏目錄描述', @status output, @message output
		if(@status = 0)
			return

		set @vListName = replace(@vListName, '/', '<\>')

		if exists(select * from vd_VListNewSubClass where pcid = @pcid and vListName = @vListName and ownerMID = @mid and cid != @cid) begin
			select @status = 0, @message = '收藏目錄名稱重複'
			return
		end

		declare @bUpdate bit = 0
		if(@o_vListDes != @vListDes or @o_vlistName != @vListName)
			set @bUpdate = 1

		
		if(@hide is null)
			set @hide = @hide_root 

		begin transaction　
			
			if(@o_vlistName != @vListName) begin
				exec xp_renameClass @cid, @vListName
			end
			
			update Class 
			set bHided = @hide, CDes = @vListDes, LastModifiedDT = iif(@bUpdate = 1, getdate(), LastModifiedDT) 
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
				from Groups g
				where Permission.CID = @cid and Permission.RoleID = g.GID 
					and Permission.RoleType = 0 and g.GName in ('Users', 'Guest')

			end

			exec xp_History_New @mid, @cid, 34, 2, null, null, @sid

			set @status = 1
			set @message = '更新影片收藏清單成功'
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