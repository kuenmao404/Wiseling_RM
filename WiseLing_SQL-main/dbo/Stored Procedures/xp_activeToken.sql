CREATE procedure [dbo].[xp_activeToken]
	@token uniqueidentifier,
	@mid int,
	@sid int,
	@status bit output,
	@message nvarchar(255) output
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try
		select @status = 0, @message = '無此會員'
		
		if not exists(select * from vs_Member where MID = @mid and mid != 0)
			return
		
		declare @iid int, @courseCID int, @groupCID int, @gid int 

		select @iid = iid, @courseCID = cid, @groupCID = gcid, @gid = gid
		from vd_AliveToken
		where Token = @token 

		if (@iid is null) begin
			set @message = '無此Token或Token已失效'
			return
		end

		if not exists(select * from vd_CourseClassGroup where PCID = @courseCID and CID = @groupCID and gid = @gid) begin
			set @message = '不存在此課程群組'
			return
		end

		declare @bExists bit = 0
		if exists(select * from vd_CourseClassGroupMember where courseCID = @courseCID and mid = @mid) begin
			set @bExists = 1
		end

		begin transaction [xp_activeToken]
			
			if(@bExists = 1) begin
				set @message = '會員已存在群組內'	
			end
			else begin
				insert into CO (CID, OID)
					values(@groupCID, @mid)

				insert into OC (CID, OID)
					values(@groupCID, @mid)
				
				insert into GM(GID, MID, Status, Role, Type)
					values(@gid, @mid, 1, 2, 0)

				insert into MG(GID, MID, Status, Role, Type)
					values(@gid, @mid, 1, 2, 0)

				declare @cid_joinCourse int = (select CID from vd_MemberClassCourseNext where mid = @mid and CName = '加入課程')

				insert into CRel(PCID, CCID)
					values(@cid_joinCourse, @courseCID)

				update Class set nObject = (select count(*) from vd_CourseClassGroupMember where courseCID = @courseCID)
				where CID = @courseCID

				set @message = '群組加入成功'	
			end

			update InviteHistory 
			set ActiveMID = @mid, ActiveDate = getdate(), bActive = 1
			where IID = @iid

			select @status = 1
			
		commit transaction [xp_activeToken]
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction [xp_activeToken]
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