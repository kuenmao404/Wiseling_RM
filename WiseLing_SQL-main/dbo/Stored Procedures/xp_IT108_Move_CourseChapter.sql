CREATE   procedure [dbo].[xp_IT108_Move_CourseChapter]
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	begin try
		
		drop table if exists #tmp

		;with tmp as(
			select c.CID 'CourseCID', c.cname 'CourseName', v.CCID, v.Rank, v.CName, v.CDes, v.Since
			from [10.21.25.71].[EDU_Technology].dbo.class c, [10.21.25.71].[EDU_Technology].dbo.vd_CourseTeachSection v
			where c.CID = v.CID and v.bDel = 0
			group by c.CID, c.cname, v.CCID, v.Rank, v.CName, v.CDes, v.Since
		)
		select v.cid, v.courseName, t.ccid, t.rank, t.cname, t.cdes, t.since, v.ownerMID, v.name 
		into #tmp
		from tmp t, vd_Course v
		where t.courseName = v.courseName

		-- select *from #tmp

		drop table if exists #tmp2
		;with t as(
			select ccid, rank, CDes
			from [10.21.25.71].[EDU_Technology].dbo.vd_CourseTeachSectionObject 
			where bDel = 0 
			group by ccid, rank, CDes
		)
		select t.ccid, v.vid, t.rank
		into #tmp2
		from t, vd_Video_Pub v
		where t.cdes = v.videoID

		-- select * from #tmp2

		begin transaction　 
			
			while(exists(select * from #tmp)) begin
				declare @courseCID int, @chapterName nvarchar(255), @chapterDes nvarchar(max), @ccid int, @mid int

				select top 1 @courseCID = cid, @chapterName = cname, @chapterDes = cdes,
							@ccid = ccid, @mid = ownerMID
				from #tmp
				order by cid, rank


				declare @chapterID int = (select cid from vd_CourseChapter where courseCID = @courseCID and chapterName = @chapterName)
				if (@chapterID is null) begin
					declare @eid int = (select EID from Entity where CName = '章節'),
							@max int = (select isnull(max(rank) + 1, 0) from vd_CourseChapter where courseCID = @courseCID),
							@pcid int = (select cid from vd_CourseNext where courseCID = @courseCID and cname = '章節')

					exec xp_insertClass @pcid, @eid, @chapterName, @chapterDes, null, null, @mid, @chapterID output

					update Inheritance set Rank = @max
					where PCID = @pcid and CCID = @chapterID
				end
				else begin
					update Class set CDes = @chapterDes where CID = @chapterID
				end


				while(exists(select * from #tmp2 where ccid = @ccid)) begin
					
					declare @vid int 

					select top 1 @vid = vid
					from #tmp2 
					where ccid = @ccid 
					order by rank
					 
					if not exists(select * from vd_CourseChapterItem where courseCID = @courseCID and cid = @chapterID and oid = @vid) begin
						declare @maxv int = (select isnull(max(rank) + 1, 0) from vd_CourseChapterItem where courseCID = @courseCID and cid = @chapterID)

						declare @cid_teach int = (select cid from vd_CourseNext where courseCID = @courseCID and cname = '教材'),
								@cid_courseNote int = (select cid from vd_CourseNext where courseCID = @courseCID and cname = '筆記'),
								@eid_teach int = (select EID from Entity where CName = '教材'),
								@eid_note int = (select EID from Entity where CName = '課程筆記')
						declare @vid_str nvarchar(max) = cast(@vid as varchar)
			
						-- 教材目錄
						declare @cid_teach_vid int = (select cid_vid from vd_CourseTeachVideo where courseCID = @courseCID and vid = @vid)
						if (@cid_teach_vid is null)
						begin
							exec xp_insertClass @cid_teach, @eid_teach, @vid_str, null, null, null, @mid, 0
						end
						else begin
							update Class set bHided = 0 where CID = @cid_teach_vid
						end

						-- 課程筆記目錄
						declare @cid_note_vid int = (select cid_vid from vd_CourseNoteVideo where courseCID = @courseCID and vid = @vid)
						if(@cid_note_vid is null)
						begin
							exec xp_insertClass @cid_courseNote, @eid_note, @vid_str, null, null, null, @mid, 0
						end
						else begin
							update Class set bHided = 0
							from fn_getChildClassWithParent(@cid_note_vid) f
							where Class.CID = f.CCID
						end

						insert into CO(CID, OID, Rank)  
							values(@chapterID, @vid, @maxv)

						insert into OC(CID, OID, Rank)  
							values(@chapterID, @vid, @maxv)

						update Class 
						set nObject = (select count(*) from vd_CourseChapterItem where courseCID = @courseCID and cid = @chapterID),
							LastModifiedDT = getdate()
						where CID = @chapterID

					end
					
					delete #tmp2 where ccid = @ccid and vid = @vid

				end

				delete #tmp 
				where cid = @courseCID and cname = @chapterName

			end
			

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