CREATE   procedure [dbo].[xp_quitCourse]
	@courseCID int, 
	@mid int,
	@sid int,
	@status bit output,
	@message nvarchar(max) output
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try
		select @status = 0, @message = 'id不符'

		
		declare @gcid int, @gename nvarchar(max), @ownerMID int = (select ownerMID from vd_Course where cid = @courseCID), @gid int 
		
		select @gcid = cid, @gename = gename, @gid = gid 
		from vd_MemberCourseClassGroup where mid = @mid and courseCID = @courseCID
		
		if (@gcid is null) begin
			return
		end

		if(@ownerMID = @mid) begin
			set @message = '課程創建者無法退出'
			return
		end


		if(@gid is null) begin
			set @message = '錯誤'
			return 
		end

		
		begin transaction　[xp_quitCourse]
			delete GM
			where GID = @gid and MID = @mid

			delete MG
			where GID = @gid and MID = @mid

			delete CO
			where cid = @gcid and OID = @mid

			delete OC
			where cid = @gcid and OID = @mid

			if not exists(select * from vd_MemberGroup where MID = @mid and GDes = @gename) begin
				declare @rootGCID int = (select CID from vd_CourseClassGroup where PCID = 0 and EName = @gename)

				delete CO
				where cid = @rootGCID and OID = @mid

				delete OC
				where cid = @rootGCID and OID = @mid
			end	

			update Class set nObject = (select count(*) from vd_CourseClassGroupMember where courseCID = @courseCID)
			where CID = @courseCID

			declare @cid_joinCourse int = (select CID from vd_MemberClassCourseNext where mid = @mid and CName = '加入課程')
			delete CRel where PCID = @cid_joinCourse and CCID = @courseCID

			select @message = '退出成功', @status = 1
			
		commit transaction	[xp_quitCourse]
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction [xp_quitCourse]
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