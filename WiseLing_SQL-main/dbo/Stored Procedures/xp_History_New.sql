CREATE   procedure [dbo].[xp_History_New]
	@mid int,
	@id int,
	@type int,
	@datatype int,
	@duration int,
	@ntid int,
	@sid int
	--Type → 18|5|16|17|14|15 
	--(影片|筆記|影片按讚|筆記按讚|影片收藏清單|隨選播放清單)
	--Datetype → 0|1|2 (I|D|U)
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try

		declare @cid int = (select CID from vd_ClassMemberNext where type = 13 and MID = @mid),
				@date date = getdate(), @datetime datetime = getdate(),
				@mapID int

		if(@cid is null)
			return

		begin transaction　
			-- lock
			declare @r int, @key nvarchar(255) = 'm' + cast(@mid as varchar) + 't' + cast(@type as varchar);
			exec @r = sp_getapplock @Resource = @key, @LockMode='Exclusive', @LockOwner = 'Transaction', @LockTimeout = 3000; -- 3秒

			set @mapID = (select MapID from CalendarHeatMap where CID = @cid and Date = @date)

			-- 會員CalendarHeatMap
			if(@mapID is null) begin
				insert into CalendarHeatMap(CID)
					values(@cid)

				set @mapID = SCOPE_IDENTITY()
			end

			declare @tmp table(hid int, datatype int)
			declare @bDel bit = 0
			
			insert into @tmp
				select hid, datatype 
				from vd_CalendarHeatMap_sys
				where  MapID = @mapID and Type = @type and ID = @id and Datatype in (0, 1, 2)


			-- 刪除動作
			if(@datatype = 1) begin
				-- 當天存在同筆新增，則視為無效
				set @bDel = iif(exists(select * from @tmp where Datatype = 0), 1, 0)

				-- 當天同筆新增修改視為無效
				update HeatMapContent set bDel = 1
				from @tmp t
				where t.datatype != 1 and t.hid = HeatMapContent.HID

			end
			-- 更新動作
			else if(@datatype = 2) begin
				-- 以當天同筆新增
				declare @ins_hid int = (select hid from @tmp where datatype = 0)

				-- 若有同筆新增，更新動作無效，以新增為主
				set @bDel = iif(@ins_hid is null, 0, 1)
				
				-- 更新同筆新增最後編輯、動作時間
				update HeatMapContent 
				set Duration = iif(@type in (18, 5), (isnull(HeatMapContent.Duration, 0) + isnull(@duration, 0)), null) , 
					LastModifiedDT = @datetime,
					NTID = @ntid
				where HID = @ins_hid
			end

			-- 不存在則新增
			if not exists(select * from @tmp where datatype = @datatype) begin
				insert into HeatMapContent(Type, ID, Datatype, bDel, Duration, NTID, MID)
					values(@type, @id, @datatype, @bDel, iif(@bDel = 1, null, @duration), @ntid,  @mid)

				declare @hid int = SCOPE_IDENTITY()

				insert into MapH
					values(@mapID, @hid)

				exec [xp_History_Course] @mid, @hid, @id, @type
				exec xp_History_Watch @mid, @hid, @type, @date
			end
			-- 更新學習紀錄，動作時間、最後修改，刪除動做除外
			else if(@bDel = 0 and @datatype != 1) begin

				update h
				set Duration = iif(@type in (18, 5), (isnull(h.Duration, 0) + isnull(@duration, 0)), null) , 
					LastModifiedDT = @datetime,
					NTID = @ntid
				from @tmp t, HeatMapContent h
				where t.hid = h.HID and t.datatype = @datatype
			end

			-- 重新統計數量
			-- 會員
			update CalendarHeatMap set nC = (select count(*) from vd_CalendarHeatMap_sys h where h.MapID = @mapID and bDel = 0 and datatype <> 1)
			where MapID = @mapID
			
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