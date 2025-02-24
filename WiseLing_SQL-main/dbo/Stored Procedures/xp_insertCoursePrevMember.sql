CREATE procedure [dbo].[xp_insertCoursePrevMember]
	@courseCID int, 
	@gid int,
	@name nvarchar(255),
	@email nvarchar(255),
	@site nvarchar(255),
	@status bit output,
	@message nvarchar(255) output
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try
		select @status = 0, @message = '課程id錯誤'

		declare @groupCID int 

		select @groupCID = cid 
		from vd_CourseClassGroup 
		where PCID = @courseCID and gid = @gid

		if (@groupCID is null)
			return

		declare @mid int

		exec [xp_insertPrevMember] 	@name,
									@email,
									@site,
									@status  output,
									@message  output,
									@mid  output

		if(@status = 0)
			return

		begin transaction 

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

			select @status = 1, @message = '群組加入成功'	
			
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

		RAISERROR( @ErrorMessage, @ErrorSeverity, @ErrorState);--回傳錯誤資訊
	end catch
	set xact_abort off
end