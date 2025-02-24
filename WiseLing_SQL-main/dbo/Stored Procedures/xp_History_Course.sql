CREATE   procedure [dbo].[xp_History_Course]
	@mid int,
	@hid int,
	@id int,
	@type int
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	begin try
		
		if(@type not in (18, 5)) 
			return

		declare @my_course table(CourseCID int, HistoryCID int, MapID int)
		declare @mapID table(MapID int)

		-- 影片觀看與筆記，將記錄到相關的課程
		declare @vid int = (select vid from Note where nid = @id and ownerMID = @mid)
		declare @date date = getdate()

		begin transaction　

			-- 取得當下有這部影片的所有課程
			;with t as(
				select v.cid
				from vd_MemberClassCourse v
				where v.mid = @mid and exists(
					select * from vd_CourseChapterVideo cv 
					where cv.courseCID = v.cid and cv.vid = iif(@type = 18, @id, @vid) and cv.c_hide = 0	
				) 
			)
			insert into @my_course (CourseCID, HistoryCID)
				select t.cid, v.cid
				from t, vd_CourseNext v
				where t.cid = v.courseCID and v.Type = 13


			insert into CalendarHeatMap(CID, Date)
				select t.HistoryCID, @date
				from @my_course t
				where not exists(select * from CalendarHeatMap c where c.CID = t.HistoryCID and c.Date = @date)
			
			
			insert into MapH(MapID, HID)
				output inserted.MapID into @mapID
				select c.MapID, @hid
				from @my_course m, CalendarHeatMap c
				where m.HistoryCID = c.CID and c.Date = @date
			

			-- 相關課程學習紀錄數量，以會員、type統計
			;with t as(
				select m.MapID, count(*) as nC
				from @mapID m
				cross apply(
					select  v.mid, v.type 
					from vd_CalendarHeatMap_sys v
					where m.MapID = v.mapID and v.bDel = 0 and v.datatype <> 1
					group by v.mid, v.type 
				) c
				group by m.MapID
			)
			update CalendarHeatMap set nC = t.nC
			from t
			where t.MapID = CalendarHeatMap.MapID
			
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
end