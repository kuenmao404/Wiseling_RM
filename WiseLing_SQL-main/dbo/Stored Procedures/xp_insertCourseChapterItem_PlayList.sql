CREATE   procedure [dbo].[xp_insertCourseChapterItem_PlayList]
	@courseCID int,
	@cid int,
	@oid_str nvarchar(max),
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
			set @message = '章節內物件上限為100個'
			return
		end

		declare @tmp table(ordinal int, id int)

		begin try
			insert into @tmp(ordinal, id)
				select ordinal, cast(value as int) 
				from string_split(@oid_str, ',', 1) 
				where value != ''
				order by ordinal
		end try
		begin catch
			set @message = '序列轉換出錯'
			return
		end catch

		delete @tmp
		where not exists(select * from vd_Video_Pub where vid = [@tmp].id) 

		delete @tmp
		where exists(select * from vd_CourseChapterItem where courseCID = @courseCID and cid = @cid and oid = [@tmp].id) 

		
		-- 刪除重複資料
		;with t as(
			select id, min(ordinal) as minO
			from @tmp
			group by id
		)
		delete @tmp 
		from t 
		where [@tmp].id = t.id and [@tmp].ordinal > t.minO

		-- 不超過100個
		;with t as(
			select top(100 - @nO) * 
			from @tmp
			order by ordinal
		)
		delete @tmp
		where not exists(select * from t where t.id = [@tmp].id)

		declare @seq int = (select isnull(max(rank) + 1, 0) from vd_CourseChapterItem where courseCID = @courseCID and cid = @cid)

		update @tmp 
		set ordinal += @seq

		begin transaction　
			declare @cid_teach int = (select cid from vd_CourseNext where courseCID = @courseCID and cname = '教材'),
					@eid_teach int = (select EID from Entity where CName = '教材'),
					@eid_note int = (select EID from Entity where CName = '課程筆記'),
				    @vid_str nvarchar(max), @id int

			insert into CO(CID, OID, Rank)  
				select @cid, id, ordinal
				from @tmp

			insert into OC(CID, OID, Rank)  
				select @cid, id, ordinal
				from @tmp

			while exists(select * from @tmp) begin
				select top 1 @vid_str = cast(id as varchar), @id = id
				from @tmp
				order by ordinal

				-- 教材目錄
				declare @cid_teach_vid int = (select cid_vid from vd_CourseTeachVideo_system where courseCID = @courseCID and vid = @id)
				if (@cid_teach_vid is null)
				begin
					exec xp_insertClass @cid_teach, @eid_teach, @vid_str, null, null, null, @mid, 0
				end
				else begin
					update Class set bHided = 0 where CID = @cid_teach_vid
				end

				delete @tmp where id = @id
			end

			set @nO = (select count(*) from vd_CourseChapterItem where courseCID = @courseCID and cid = @cid)

			update Class 
			set nObject = @nO,
				LastModifiedDT = getdate()
			where CID = @cid

			select @status = 1, @message = '新增' + iif(@nO >= 100, '新增成功，章節內物件上限為100個', '成功')
			

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
	set xact_abort off
end