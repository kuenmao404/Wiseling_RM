CREATE   procedure [dbo].[xp_deleteCourseChapterItem]
	@courseCID int,
	@cid int,
	@type int,
	@oid int,
	@sid int,
	@status bit output,
	@message nvarchar(max) output
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try
		select @status = 0, @message = 'id不符'
		
		if not exists(select * from vd_CourseChapterItem where courseCID = @courseCID and cid = @cid and oid = @oid and type = @type) begin
			return
		end

		begin transaction　[xp_deleteCourseChapterItem]

			if(@type = 18 and not exists(select * from vd_CourseChapterItem where courseCID = @courseCID and cid != @cid and oid = @oid and @type = @type)) begin
				declare @cid_teach_vid int = (select cid_vid from vd_CourseTeachVideo where courseCID = @courseCID and vid = @oid)

				update n set bDel = 1
				from vd_CourseTeachVideoNote v, NoteCourse n
				where v.courseCID = @courseCID and v.vid = @oid and v.nid = n.NID

				update Class set bHided = 1 where CID = @cid_teach_vid
			end
			
			delete CO where CID = @cid and OID = @oid
			delete OC where CID = @cid and OID = @oid
			
			update Class 
			set nObject = (select count(*) from vd_CourseChapterItem where courseCID = @courseCID and cid = @cid),
				LastModifiedDT = getdate()
			where CID = @cid

			select @status = 1, @message = '刪除課程章節內' + iif(@type = 18, '影片', '題目') +  '成功' 

		commit transaction	[xp_deleteCourseChapterItem]
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction [xp_deleteCourseChapterItem]
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