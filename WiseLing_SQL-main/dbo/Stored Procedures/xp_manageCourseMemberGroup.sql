CREATE   procedure [dbo].[xp_manageCourseMemberGroup]
	@courseCID int, 
	@cid int,
	@memberMID int,
	@groupCID int,
	@mid int,
	@sid int,
	@status bit output,
	@message nvarchar(max) output
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	select @status = 0, @message = '錯誤'
	begin try
		
		declare @gid int, @gname nvarchar(255), @gename nvarchar(255),
				 @o_gid int, @o_gname nvarchar(255), @o_gename nvarchar(255), @memberRole int, @o_groupCID int

		select @gid = gid, @gname = CName, @gename = EName
		from vd_CourseClassGroup 
		where PCID = @courseCID and NCID = @cid and CID = @groupCID

		select @o_gid = gid, @o_gname = gname, @o_gename = gename, @memberRole = role, @o_groupCID = cid
		from vd_CourseClassGroupMember 
		where courseCID = @courseCID and mid = @memberMID

		if(@gid is null or @o_gid is null) begin
			return
		end

		if(@o_gename = 'CourseManager' and @memberRole <= (select role from vd_CourseClassGroupMember where courseCID = @courseCID and mid = @mid and gename = 'CourseManager')) begin
			set @message = '權限不足，無法更動'
			return
		end

		begin transaction　[xp_manageCourseMemberGroup]
			update GM
			set Role = 2, GID = @gid
			where GID = @o_gid and MID = @memberMID
			
			update MG
			set Role = 2, GID = @gid
			where GID = @o_gid and MID = @memberMID

			update CO 
			set CID = @groupCID
			where CID = @o_groupCID and OID = @memberMID

			update OC 
			set CID = @groupCID
			where CID = @o_groupCID and OID = @memberMID
	
			declare @rootGCID int = (select CID from vd_CourseClassGroup where PCID = 0 and EName = @gename),
					@o_rootGCID int = (select CID from vd_CourseClassGroup where PCID = 0 and EName = @o_gename)

			update CO
			set CID = @rootGCID
			where cid = @o_rootGCID and OID = @memberMID

			update OC
			set CID = @rootGCID
			where cid = @o_rootGCID and OID = @memberMID

			select @message = '編輯會員群組成功', @status = 1
			
		commit transaction	[xp_manageCourseMemberGroup]
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction [xp_manageCourseMemberGroup]
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