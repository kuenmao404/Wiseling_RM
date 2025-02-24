CREATE   procedure [dbo].[xp_updateCourseChapter]
	@courseCID int,
	@cid int,
	@chapterName nvarchar(230),
	@chapterDes nvarchar(3950),
	@sid int,
	@status bit output,
	@message nvarchar(max) output
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try
		select @status = 0, @message = 'id不符'

		set @chapterName = replace(@chapterName, '/', '<\>')

		declare @o_cname nvarchar(230) = (select chapterName from vd_CourseChapter where courseCID = @courseCID and cid = @cid)

		if(@o_cname is null) begin
			return
		end

		if exists(select * from vd_CourseChapter where courseCID = @courseCID and chapterName = @chapterName and cid != @cid) begin
			set @message = '課程章節名稱重複'
			return
		end

		declare @bUpdate bit = 1

		if( (@chapterName is null or len(@chapterName) = '' or @o_cname = @chapterName) and @chapterDes is null) begin
			set @bUpdate = 0
		end

		begin transaction　[xp_updateCourseChapter]
			
			if(@chapterName is not null and len(@chapterName) != '' and @o_cname != @chapterName) begin
				exec xp_renameClass @cid, @chapterName
			end
		
			update Class 
			set CDes = isnull(@chapterDes, CDes), LastModifiedDT = iif(@bUpdate = 1, getdate(), LastModifiedDT) 
			where CID = @cid

			select @status = 1, @message = '編輯章節成功' 

		commit transaction	[xp_updateCourseChapter]
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction [xp_updateCourseChapter]
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