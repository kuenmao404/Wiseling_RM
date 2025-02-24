CREATE   procedure [dbo].[xp_updatePList]
	@cid int,
	@vListName nvarchar(200),
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

		declare @cid_root int, @hide_root bit, @eid int = (select eid from Entity where CName = '隨選播放清單')
		
		select @cid_root = cid, @hide_root = hide 
		from vd_ClassMemberNext 
		where MID = @mid and Type = @eid

		declare @vListName_o nvarchar(255), @vListDes_o nvarchar(4000)
		
		select @vListName_o = vListName, @vListDes_o = vListDes
		from vd_MemberClassPList where mid = @mid and cid = @cid

		if(@vListName_o is null) begin
			return
		end

		if(@vListName is null or len(@vListName) = 0) begin
			set @message = '名稱不得為空'
			return
		end


		if exists(select * from vd_MemberClassPList where mid = @mid and vListName = @vListName and cid != @cid) begin
			set @message = '隨選播放清單名稱重複'
			return
		end

		if(@hide is null)
			set @hide = @hide_root

		declare @bChange bit = 0
		if(@vListName_o != @vListName or (@vListDes != @vListDes_o and @vListDes is not null))
			set @bChange = 1

		begin transaction　[xp_updatePList]
			
			if(@vListName_o != @vListName)begin
				exec xp_renameClass @cid, @vListName
			end
			
			update Class 
			set bHided = @hide, LastModifiedDT = iif(@bChange = 1, getdate(), LastModifiedDT) ,
				CDes = isnull(@vListDes, CDes)
			where CID = @cid

			-- 公開
			if(@hide = 0) begin
				
				insert into Permission(CID, PermissionBits, RoleID, RoleType)
					select f.CCID, 3, g.GID, 0
					from fn_getChildClassWithParent(@cid) f, Groups g
					where g.GName in ('Users', 'Guest') and 
					not exists(select * from Permission where CID = f.CCID and RoleType = 0 and RoleID = g.GID)
			end
			else begin

				delete Permission
				from fn_getChildClassWithParent(@cid) f, Groups g
				where Permission.CID = f.CCID and Permission.RoleID = g.GID 
					and Permission.RoleType = 0 and g.GName in ('Users', 'Guest')

			end

			exec xp_History_New @mid, @cid, 15, 2, null, null, @sid

			set @status = 1
			set @message = '編輯隨選播放清單成功'
		commit transaction	[xp_updatePList]
		--登入新增新的一筆MSession
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction [xp_updatePList]
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