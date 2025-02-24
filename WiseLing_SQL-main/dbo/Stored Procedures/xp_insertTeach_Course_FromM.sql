CREATE   procedure [dbo].[xp_insertTeach_Course_FromM]
	@courseCID int,
	@cid int,  -- 課程教材cid
	@notebookCID int,
	@vid int,
	@nid int,  -- @mode = all，可傳null
	@mode nvarchar(50) = 'single', -- single|all (單一筆記|全部匯入)
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

		declare @cid_vid int = (select cid_vid from vd_CourseTeachVideo where courseCID = @courseCID and cid = @cid and vid = @vid),
				@startTime float, @endTime float, @ntid int

		select @startTime = startTime, @endTime = endTime, @ntid = contentNTID 
		from vd_MemberNoteClass_Front 
		where nid = @nid and mid = @mid and vid = @vid and cid = @notebookCID

		if (@cid_vid is null or (@ntid is null and @mode = 'single')) begin
			return
		end


		if(@mode = 'single' and exists(
			select * 
			from NoteCourse 
			where CourseCID = @courseCID and vid = @vid 
				and cast(startTime as int) <= cast(@startTime as int) and isnull(cast(endTime as int), startTime) >= isnull(cast(@endTime as int), @startTime) 
				and bDel = 0
			))
		begin
			set @message = '該時區間內已存在筆記'
			return
		end

		begin transaction　
			
			declare @inserted table(nid int)

			if(@mode = 'single') begin
				insert into NoteCourse(VID, CourseCID, OwnerMID, StartTime, EndTime, ContentNTID)
					output INSERTED.NID into @inserted
					select vid, @courseCID, @mid, startTime, endTime, contentNTID 
					from vd_Note 
					where nid = @nid and ownerMID = @mid and vid = @vid  
			end
			else if(@mode = 'all') begin
				insert into NoteCourse(VID, CourseCID, OwnerMID, StartTime, EndTime, ContentNTID)
					output INSERTED.NID into @inserted
					select vid, @courseCID, @mid, startTime, endTime, contentNTID 
					from vd_MemberNoteClass_Front v
					where mid = @mid and vid = @vid and cid = @notebookCID
					and not exists(
						select * 
						from NoteCourse n 
						where n.bDel = 0 and n.CourseCID = @courseCID and vid = @vid
						and cast(n.startTime as int) <= cast(v.startTime as int) and isnull(cast(n.endTime as int), n.startTime) >= isnull(cast(v.endTime as int), v.startTime) 
					)
			end
		

			insert into NCCourse(NID, CID)
				select nid, @cid_vid from @inserted

			insert into CNCourse(NID, CID)
				select nid, @cid_vid from @inserted

			declare @c int = (select count(*) from @inserted)
			select @status = 1, @message = CAST(@c as varchar) + '個筆記新增成功'
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