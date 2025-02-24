CREATE procedure [dbo].[xp_insertVListPlayList_New]
	@cid int,
	@vid_str nvarchar(max),
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
			
		declare @nC int = (
			select count(*) from vd_VListNotebook where vListCID = @cid and ownerMID = @mid
		)

		if not exists(select 1 from vd_VListNew where cid = @cid and ownerMID = @mid)
			set @message = 'ID不符'
		else if(@nC >= 100)
			set @message = '影片上限為100個'
		else 
			set @status = 1

		if(@status = 0)
			return

		declare @tmp table(ordinal int, vid int)
		declare @exists table(vid int)
		declare @instmp table(ordinal int, vid int, cid int)

		begin try
			insert into @tmp(ordinal, vid)
				select ordinal, cast(value as int) 
				from string_split(@vid_str, ',', 1) 
				where value != ''
				order by ordinal
		end try
		begin catch
			select @status = 0, @message = '序列轉換出錯'
			return
		end catch

		-- 刪除重複資料 (youtube播放清單允許相同影片出現N次)
		;with t as(
			select vid, min(ordinal) as minO
			from @tmp
			group by vid
		)
		delete @tmp 
		from t 
		where [@tmp].vid = t.vid and [@tmp].ordinal > t.minO

		-- 刪除不存在在系統的影片
		delete @tmp
		where not exists(select * from vd_Video_Pub where vid = [@tmp].vid) 

		-- 刪除播放清單內已有的影片
		delete @tmp
		output deleted.vid into @exists
		where exists(select * from vd_VListNotebook v where vListCID = @cid and ownerMID = @mid and v.vid = [@tmp].vid) 

		-- 選擇數量不超過100限制的影片
		declare @seq int = (select isnull(max(rank) + 1, 0) from vd_VListNotebook where vListCID = @cid and ownerMID = @mid)

		insert into @instmp
			select top (100 - @nC) row_number() over (order by ordinal) + @seq, vid, null
			from @tmp

		-- 需要新增預設筆記本的影片
		declare @insNewNotebook table(vid int, ordinal int)
		
		insert into @insNewNotebook
			select t.vid, t.ordinal
			from @instmp t
			where not exists(select 1 from vd_MemberClassNoteBook_New v where v.ownerMID = @mid and vid = t.vid)

		begin transaction 			
			
			declare @vid int, @cname nvarchar(255), @outCID int
			declare @cid_note int = (select CID from vd_ClassMemberNext where MID = @mid and type = 19)

			while exists(select * from @insNewNotebook) begin
				set @vid = (select top 1 vid from @insNewNotebook order by ordinal)
				set @cname = '我的筆記_' + cast(@vid as varchar) 

				-- 預設筆記本
				exec xp_insertClass @cid_note, 19, @cname, '我的筆記', null, null, @mid, @outCID output

				update Class set bHided = 1, cRank = 1, ID = @vid where CID = @outCID

				delete @insNewNotebook where vid = @vid
			end

			update t 
			set cid = v.cid
			from @instmp t, vd_MemberClassNoteBook_New v
			where v.ownerMID = @mid and v.bDefault = 1 and v.vid = t.vid

			insert into CRel(PCID, CCID, Rank)
				select @cid, cid, ordinal from @instmp
			
			set @nC = (select count(*) from vd_VListNotebook where vListCID = @cid and ownerMID = @mid)
						
			
			update Class 
			set nObject = @nC + (select count(*) from vd_VListNewSubClass where pcid = @cid and ownerMID = @mid),
				LastModifiedDT = getdate()
			where CID = @cid

			exec xp_History_New @mid, @cid, 34, 2, null, null, @sid


			declare @nIns int = (select count(*) from @instmp),
					@nExists int = (select count(*) from @exists)

			declare @messageTable table(string nvarchar(255))

			insert into @messageTable
				values (iif(@nIns > 0, '成功新增' + cast(@nIns as varchar) + '個筆記本', '')), 
						(iif(@nExists > 0, cast(@nExists as varchar) + '個筆記本已存在', '')), 
						(iif(@nC >= 100, '數量上限為100個', ''))

			
			select @status = iif(@nIns = 0, 0, 1), @message = (select STRING_AGG(string, char(10)) from @messageTable where string != '')
			if(@nIns = 0 and @nExists = 0)
				select @status = 0, @message = '錯誤'
			
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