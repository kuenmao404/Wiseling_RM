create   procedure [dbo].[xp_deleteCourseChapter]
	@courseCID int,
	@cid int,
	@sid int,
	@status bit output,
	@message nvarchar(max) output
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try
		select @status = 0, @message = 'id不符'
		
		declare @cname nvarchar(230) = (select chapterName from vd_CourseChapter where courseCID = @courseCID and cid = @cid)

		if(@cname is null) begin
			return
		end

		begin transaction　[xp_deleteCourseChapter]
			
			declare @rename nvarchar(255) = @cname + '_' + cast(@cid as varchar)

			exec xp_renameClass @cid, @rename

			update Class set bDel = 1 where CID = @cid

			select @status = 1, @message = '刪除章節成功' 

		commit transaction	[xp_deleteCourseChapter]
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction [xp_deleteCourseChapter]
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