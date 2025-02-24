CREATE    procedure [dbo].[xp_importToCourseChapter]
	@cid int,   -- 課程CID
	@cidListstr nvarchar(512),  -- 清單CID，1,2,3,4,5
	@mid int,
	@sid int,
	@status bit output,
	@message nvarchar(255) output
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	select @status = 0, @message = '錯誤'
	begin try
		set @message = 'id不符'

		if (not exists(select * from vd_Course where cid = @cid) or @cidListstr is null or len(@cidListstr) = 0)
			return
		
		declare @tmp table(ordinal int, id int, vListName nvarchar(255), vListDes nvarchar(4000), nO int)
		declare @tmp_ins table(ordinal int, id int, vListName nvarchar(255), vListDes nvarchar(4000), nO int, chapterCID int)

		-- 檢查並取得會員收藏清單
		insert into @tmp
			select ordinal, cast(s.value as int), v.vListName, v.vListDes, v.nO
			from string_split(@cidListstr, ',', 1) s, vd_VListNew v
			where cast(s.value as int) = v.cid and ownerMID = @mid and v.nlevel <> 0

		declare @n_all int = (select count(*) from @tmp)

		if(@n_all = 0)
			return

		declare @eid int = (select EID from Entity where CName = '章節'), @seq int, @n_ins int
		declare	@chapterRootCID int = (select cid from vd_CourseNext where courseCID = @cid and Type = @eid)

		begin transaction
			
			set @seq = (select isnull(max(rank) + 1, 0) from vd_CourseChapter where courseCID = @cid)

			-- 取得與章節名稱不重複的收藏清單
			insert into @tmp_ins
				select row_number() over (order by ordinal) + @seq, id, vListName, vListDes, nO, null
				from @tmp t
				where not exists(select * from vd_CourseChapter where courseCID = @cid and chapterName = t.vListName)

			set @n_ins = (select count(*) from @tmp_ins)

			-- 匯入章節
			declare @i int = 0, @end int = (select count(*) from @tmp_ins)
			while (@i < @end) begin
				declare @chapterName nvarchar(255), @chapterDes nvarchar(4000), @outcid int, @cur_id int

				select @cur_id = id, @chapterName = vListName, @chapterDes = vListDes
				from @tmp_ins
				order by ordinal
				offset @i ROWs FETCH Next 1 ROWS ONLY

				exec xp_insertClass @chapterRootCID, @eid, @chapterName, @chapterDes, null, null, @mid, @outcid output

				update @tmp_ins set chapterCID = @outcid where id = @cur_id

				set @i += 1
			end

			-- 章節影片數量
			update Class set nObject = t.nO
			from @tmp_ins t
			where Class.CID = t.chapterCID

			-- 章節排序
			update i set Rank = t.ordinal
			from Inheritance i, @tmp_ins t
			where i.PCID = @chapterRootCID and i.CCID = t.chapterCID

			--------------------------

			declare @insCO table(cid int, oid int, rank int)

			--- 匯入章節影片
			;with tmp as(
				select t.chapterCID, v.vid, v.rank, ROW_NUMBER() over (partition by vid order by v.rank) as num
				from @tmp_ins t, vd_VListVideo v
				where t.id = v.vListCID
			)
			insert into CO(CID, OID, Rank)  
				output inserted.CID, inserted.OID, inserted.Rank into @insCO
				select chapterCID, vid, rank
				from tmp
				where num = 1
				
			insert into OC(CID, OID, Rank)  
				select cid, oid, rank
				from @insCO

			-----------------------

			---- 每個影片的教材目錄
			declare @cid_teach int = (select cid from vd_CourseNext where courseCID = @cid and cname = '教材'),
					@eid_teach int = (select EID from Entity where CName = '教材'),
					@eid_note int = (select EID from Entity where CName = '課程筆記')
			
			declare @ins_Video table(notebookCID int, cid_vid int, vid int)

			insert into @ins_Video(vid)
				select v.vid
				from @tmp_ins t, vd_VListVideo v
				where t.id = v.vListCID
			
			while exists(select * from @ins_Video) begin
				declare @vid int = (select top 1 vid from @ins_Video)
				declare @vid_str nvarchar(255) = cast(@vid as varchar)

				
				declare @cid_teach_vid int = (select cid_vid from vd_CourseTeachVideo_system where courseCID = @cid and vid = @vid)
				if (@cid_teach_vid is null)
				begin
					-- 教材目錄
					exec xp_insertClass @cid_teach, @eid_teach, @vid_str, null, null, null, @mid, 0
				end
				else begin
					update Class set bHided = 0 where CID = @cid_teach_vid
				end

				delete @ins_Video where vid = @vid
			end

			-------------

			-- 指定筆記本
			insert into @ins_Video(notebookCID, cid_vid, vid)
				select v.cid, c.cid_vid, v.vid
				from @tmp_ins t, vd_VListVideo v, vd_CourseTeachVideo_system c
				where t.id = v.vListCID and v.cid is not null and v.vid = c.vid and c.courseCID = @cid
	
			-- 只有影片，預設匯入第一個筆記本
			;with d as(
				select cid, vid, ROW_NUMBER() over (partition by vid order by bDefault desc) as rank
				from vd_MemberClassNoteBook_New
				where ownerMID = @mid
			), tmp as(
				select d.cid, v.vid
				from @tmp_ins t, vd_VListVideo v, d
				where t.id = v.vListCID and v.cid is null and v.vid = d.vid and d.rank = 1
			)
			insert into @ins_Video(notebookCID, cid_vid, vid)
				select tmp.cid, c.cid_vid, tmp.vid
				from tmp, vd_CourseTeachVideo_system c
				where tmp.vid = c.vid and c.courseCID = @cid

			declare @inserted table(nid int, vid int)

			-- 會入課程筆記
			insert into NoteCourse(VID, CourseCID, OwnerMID, StartTime, EndTime, ContentNTID)
				output inserted.NID, inserted.vid into @inserted
				select v.vid, @cid, @mid, startTime, endTime, contentNTID 
				from @ins_Video t, vd_MemberNoteClass_Front v
				where t.vid = v.vid and v.mid = @mid and v.cid = t.notebookCID
				
			-- 會入課程教材目錄關聯課程筆記
			insert into NCCourse(NID, CID)
				select nid, v.cid_vid
				from @inserted i, @ins_Video v
				where i.vid = v.vid
				group by  nid, v.cid_vid

			insert into CNCourse(NID, CID)
				select nid, v.cid_vid
				from @inserted i, @ins_Video v
				where i.vid = v.vid
				group by  nid, v.cid_vid

			set @status = 1
			set @message = ''

			if(@n_ins > 0)
				set @message = '匯入' + cast(@n_ins as varchar) + '個收藏清單'

			declare @n_same int = @n_all - @n_ins
			if(@n_same > 0)
				set @message += char(10) + cast(@n_same as varchar) + '個清單名稱與章節重複無法匯入'

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
end