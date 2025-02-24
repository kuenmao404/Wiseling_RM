CREATE   procedure [dbo].[xp_insertPList]
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

		declare @cid int, @hide_root bit, @eid int = (select eid from Entity where CName = '隨選播放清單')
		
		select @cid = cid, @hide_root = hide 
		from vd_ClassMemberNext 
		where MID = @mid and Type = @eid

		if(@cid is null)
			return

		if exists(select * from vd_MemberClassPList where mid = @mid and vListName = @vListName) begin
			set @message = '隨選播放清單名稱重複'
			return
		end

		if(@vListName is null or len(@vListName) = 0) begin
			set @message = '隨選播放清單名稱不為空'
			return
		end

		if(@hide is null)
			set @hide = @hide_root

		begin transaction　
			
			declare @cid_out int
			exec xp_insertClass @cid, @eid, @vListName, @vListDes, null, null, @mid, @cid_out output

			update Class set nObject = (select count(*) from vd_MemberClassPList where mid = @mid)
			where CID = @cid

			declare @seq int = (select isnull(max(rank) + 1, 0) from vd_MemberClassPList where mid = @mid)

			update Inheritance set Rank = @seq
			where PCID = @cid and CCID = @cid_out

			update Class set bHided = @hide where CID = @cid_out

			-- 公開
			if(@hide = 0) begin
				
				insert into Permission(CID, PermissionBits, RoleID, RoleType)
					select @cid_out, 3, g.GID, 0
					from Groups g
					where g.GName in ('Users', 'Guest') and 
					not exists(select * from Permission where CID = @cid_out and RoleType = 0 and RoleID = g.GID)
			end
			else begin

				delete Permission
				from Groups g
				where Permission.CID = @cid_out and Permission.RoleID = g.GID 
					and Permission.RoleType = 0 and g.GName in ('Users', 'Guest')

			end

			exec xp_History_New @mid, @cid_out, 15, 0, null, null, @sid


			set @status = 1
			set @message = '新增隨選播放清單成功'
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