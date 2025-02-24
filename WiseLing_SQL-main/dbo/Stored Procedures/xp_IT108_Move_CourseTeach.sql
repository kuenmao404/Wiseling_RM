CREATE   procedure [dbo].[xp_IT108_Move_CourseTeach]
	@courseCID_it108 int,
	@courseCID int
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	begin try
		
		drop table if exists #tmp_Move_CourseTeach

		select c.*, v.videoID, CurrentTime + isnull(EndTime, 0) 'RealEndTime',
		'## ' + c.Title + char(10) + char(10) + C.Content as Note, dbo.fs_getMD5Encode('## ' + c.Title + char(10) + char(10) + C.Content) 'md5'
		into #tmp_Move_CourseTeach
		from [10.21.25.71].EDU_Technology.dbo.vd_CourseNote C, [10.21.25.71].EDU_Technology.dbo.Video v
		where c.CID = @courseCID_it108 and c.isTeach = 1 and c.bDel = 0 and c.vid = v.VID

		begin transaction　 [xp_IT108_Move_CourseTeach]
			
			insert into NText(Text, MD5)
				select t.Note, t.md5
				from #tmp_Move_CourseTeach t
				where not exists(select * from NText n where t.md5 = n.md5)

			update NoteCourse 
			set bDel = 1 
			from vd_CourseTeachVideo v, #tmp_Move_CourseTeach t
			where NoteCourse.CourseCID = @courseCID and v.courseCID = @courseCID and v.videoID = t.videoID
			and NoteCourse.VID = v.vid

			declare @tmp table(NID int, VID int)

			insert into NoteCourse(CourseCID, VID, OwnerMID, StartTime, EndTime, ContentNTID, Since, LastModifiedDT)
				output inserted.NID, inserted.VID into @tmp
				select @courseCID, v.vid, 0, t.CurrentTime, iif(t.RealEndTime = t.CurrentTime, null, t.RealEndTime), n.NTID, t.since, t.lastmodified
				from vd_CourseTeachVideo v, #tmp_Move_CourseTeach t, NText n
				where v.courseCID = @courseCID and v.videoID = t.videoID and t.md5 = n.MD5

			insert into CNCourse(CID, NID)
				select v.cid_vid, t.nid 
				from vd_CourseTeachVideo v, @tmp t
				where v.courseCID = @courseCID and v.vid = t.vid

			insert into NCCourse(CID, NID)
				select v.cid_vid, t.nid 
				from vd_CourseTeachVideo v, @tmp t
				where v.courseCID = @courseCID and v.vid = t.vid
			
			update NoteCourse set OwnerMID = (select ownerMID from vd_Course where cid = @courseCID)
			where CourseCID = @courseCID and OwnerMID = 0

		commit transaction	[xp_IT108_Move_CourseTeach]
		--登入新增新的一筆MSession
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction  [xp_IT108_Move_CourseTeach]
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