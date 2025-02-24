CREATE   procedure [dbo].[xp_insertCourseChapterItem]
	@courseCID int,
	@cid int,
	@type int, -- 18|20 (影片|題目)
	@oid int,
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
		
		declare @nO int = (
			select nO from vd_CourseChapter where courseCID = @courseCID and cid = @cid
		)

		if (@nO is null)
			return
		
		if (@nO >= 100) begin
			set @message = '單一章節內物件上限為100個'
			return
		end

		if (not exists(select * from vd_Video_Pub where vid = @oid) and @type = 18) begin
			return
		end
		else if(not exists(select * from vd_Problem where pid = @oid) and @type = 20) begin
			return
		end

		if exists(select * from CO where CID = @cid and OID = @oid) begin
			set @message = '章節內已有此' + iif(@type = 18, '影片', '題目')
			return
		end

		declare @max int = (select max(rank) from vd_CourseChapterItem where courseCID = @courseCID and cid = @cid)

		begin transaction　[xp_insertCourseChapterItem]
			
			if(@type = 18) begin
				declare @cid_teach int = (select cid from vd_CourseNext where courseCID = @courseCID and cname = '教材'),
						@eid_teach int = (select EID from Entity where CName = '教材'),
						@eid_note int = (select EID from Entity where CName = '課程筆記')
				declare @vid_str nvarchar(max) = cast(@oid as varchar)
			
				-- 教材目錄
				declare @cid_teach_vid int = (select cid_vid from vd_CourseTeachVideo_system where courseCID = @courseCID and vid = @oid)
				if (@cid_teach_vid is null)
				begin
					exec xp_insertClass @cid_teach, @eid_teach, @vid_str, null, null, null, @mid, 0
				end
				else begin
					update Class set bHided = 0 where CID = @cid_teach_vid
				end

				
			end

			insert into CO(CID, OID, Rank)  
				values(@cid, @oid, iif(@max is null, 0, @max + 1))

			insert into OC(CID, OID, Rank)  
				values(@cid, @oid, iif(@max is null, 0, @max + 1))

			update Class 
			set nObject = (select count(*) from vd_CourseChapterItem where courseCID = @courseCID and cid = @cid),
				LastModifiedDT = getdate()
			where CID = @cid

			select @status = 1, @message = '新增' + iif(@type = 18, '影片', '題目') + '成功' 
			

		commit transaction	[xp_insertCourseChapterItem]
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction [xp_insertCourseChapterItem]
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