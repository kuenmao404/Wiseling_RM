CREATE   procedure [dbo].[xp_inviteCourseMember]
	@courseCID int, 
	@cid int,
	@email nvarchar(max),
	@expires int,
	@mid int,
	@sid int,
	@iid int output,
	@courseName nvarchar(255) output,
	@gname nvarchar(255) output,
	@token uniqueidentifier output,
	@expired nvarchar(255) output,
	@status bit output,
	@message nvarchar(max) output
as
begin
	set xact_abort on 
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try
		select @status = 0, @message = 'id不符', @token = null, @expired = null, @iid = null, @gname = null, @courseName = null
		
		declare @gid int
		
		select @gid = gid, @gname = CName, @courseName = PName from vd_CourseClassGroup where PCID = @courseCID and CID = @cid
		
		if(@gid is null) begin
			return
		end
		
		begin transaction　[xp_inviteCourseMember]
			
			declare @ExpiredDT datetime = DATEADD(SECOND, @expires, getdate())

			select @token = newid(), @expired = convert(varchar, @ExpiredDT, 120)

			insert into InviteHistory(CourseCID, GID, InviteMID, Token, EMail, ExpiredDT, GroupCID)
				values(@courseCID, @gid, @mid, @token, @email, @ExpiredDT, @cid)

			set @iid = SCOPE_IDENTITY()

			select @message = 'Log成功', @status = 1
			
		commit transaction	[xp_inviteCourseMember]
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction [xp_inviteCourseMember]
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