CREATE   procedure [dbo].[xp_insertCourseChapter]
	@courseCID int,
	@cid int,
	@chapterName nvarchar(230),
	@chapterDes nvarchar(3950),
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
		
		if not exists(select * from vd_CourseNext where courseCID = @courseCID and cid = @cid and cname = '章節') begin
			return
		end

		if exists(select * from vd_CourseChapter where courseCID = @courseCID and chapterName = @chapterName) begin
			set @message = '課程章節名稱重複'
			return
		end

		if(@chapterName is null or len(@chapterName) = 0) begin
			set @message = '章節名稱不可為空白' 
			return
		end

		declare @eid int = (select EID from Entity where CName = '章節'),
				@max int = (select max(rank) from vd_CourseChapter where courseCID = @courseCID)

		begin transaction　[xp_insertCourseChapter]
			
			declare @outcid int 
			exec xp_insertClass @cid, @eid, @chapterName, @chapterDes, null, null, @mid, @outcid output

			update Inheritance set Rank = iif(@max is null, 0, @max + 1)
			where PCID = @cid and CCID = @outcid

			select @status = 1, @message = '新增章節成功' 

		commit transaction	[xp_insertCourseChapter]
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction [xp_insertCourseChapter]
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