CREATE   procedure [dbo].[xp_deleteCourseMember]
	@courseCID int, 
	@cid int,
	@deleteMID int,
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

		declare @gid int = (
			select GID 
			from vd_CourseClassGroup 
			where PCID = @courseCID and CID = @cid
		)

		declare @gename nvarchar(255) = (
			select gename from vd_CourseClassGroupMember
			where courseCID = @courseCID and cid = @cid and mid = @deleteMID
		)

		declare @myRole int = (select Role from vd_MemberGroup where MID = @mid and ID = @courseCID and GDes = 'CourseManager'),
				@hisRole int = (select Role from vd_MemberGroup where MID = @deleteMID and ID = @courseCID and GDes = 'CourseManager'),
				@ownerMID int = (select ownerMID from vd_Course where cid = @courseCID)

		if(@mid = @deleteMID) begin
			set @message = '無法將自己踢出'
		end
		else if(@ownerMID = @deleteMID)begin
			set @message = '無法踢出課程創建者'
		end
		else if (@myRole >= @hisRole) begin
			set @message = '權限不足，無法踢出'
		end
		else 
			set @status = 1

		if (@status = 0 or @gename is null or @gid is null) begin
			set @status = 0
			return
		end
		
		begin transaction　[xp_deleteCourseMember]
			delete GM
			where GID = @gid and MID = @deleteMID

			delete MG
			where GID = @gid and MID = @deleteMID

			delete CO
			where cid = @cid and OID = @deleteMID

			delete OC
			where cid = @cid and OID = @deleteMID

			if not exists(select * from vd_MemberGroup where MID = @deleteMID and GDes = @gename) begin
				declare @rootGCID int = (select CID from vd_CourseClassGroup where PCID = 0 and EName = @gename)

				delete CO
				where cid = @rootGCID and OID = @deleteMID

				delete OC
				where cid = @rootGCID and OID = @deleteMID
			end	

			update Class set nObject = (select count(*) from vd_CourseClassGroupMember where courseCID = @courseCID)
			where CID = @courseCID

			declare @cid_joinCourse int = (select CID from vd_MemberClassCourseNext where mid = @deleteMID and CName = '加入課程')
			delete CRel where PCID = @cid_joinCourse and CCID = @courseCID

			select @message = '踢出成功', @status = 1
			
		commit transaction	[xp_deleteCourseMember]
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction [xp_deleteCourseMember]
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