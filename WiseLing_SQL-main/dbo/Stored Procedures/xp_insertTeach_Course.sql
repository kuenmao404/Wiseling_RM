CREATE   procedure [dbo].[xp_insertTeach_Course]
	@courseCID int,
	@cid int,
	@vid int,
	@startTime float,
	@endTime float,
	@content nvarchar(max),
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

		declare @cid_vid int = (select cid_vid from vd_CourseTeachVideo where courseCID = @courseCID and cid = @cid and vid = @vid)
		if (@cid_vid is null) begin
			return
		end

		if(@startTime is null) begin
			set @message = '開始時間不能為空'
			return
		end
		
		if(@startTime > @endTime) begin
			set @message = '結束時間不得小於開始時間'
			return
		end

		if exists(
			select * 
			from NoteCourse
			where CourseCID = @courseCID and vid = @vid 
				and cast(startTime as int) = cast(@startTime as int) and bDel = 0
			) 
		begin
			set @message = '已存在教材於相近時間點'
			return
		end

		if exists(
			select * 
			from NoteCourse 
			where CourseCID = @courseCID and vid = @vid 
				and cast(startTime as int) <= cast(@startTime as int) and cast(endTime as int) >= cast(@endTime as int) 
				and bDel = 0
			)
		begin
			set @message = '該時區間內已存在筆記'
			return
		end

		begin transaction　[xp_insertTeach_Course]
			
			declare @md5 nvarchar(32) = dbo.fs_getMD5Encode(@content)

			declare @ntid int = (select ntid from NText where MD5 = @md5)

			if(@ntid is null) begin

				insert into NText(Text, MD5, Length)
					values(@content, @md5, len(@content))

				set @ntid = SCOPE_IDENTITY()
			end

			declare @nid int 

			insert into NoteCourse(VID, CourseCID, OwnerMID, StartTime, EndTime, ContentNTID)
				values(@vid, @courseCID, @mid, @startTime, @endTime, @ntid)

			set @nid = SCOPE_IDENTITY()

			insert into NCCourse(NID, CID)
				values(@nid, @cid_vid)

			insert into CNCourse(NID, CID)
				values(@nid, @cid_vid)

			select @status = 1, @message = '新增成功'
		commit transaction	[xp_insertTeach_Course]
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction [xp_insertTeach_Course]  
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