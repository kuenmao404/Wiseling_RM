CREATE procedure [dbo].[xp_insertVListVideo]
	@cid int,
	@idstr nvarchar(4000),
	@mode nvarchar(20) = 'video', -- video|notebook
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
		declare @nC int = (select count(*) from vd_VListVideo where vListCID = @cid and ownerMID = @mid), 
			@seq int = (select isnull(max(rank) + 1, 0) from vd_VListVideo where vListCID = @cid and ownerMID = @mid)

		if(@mode not in('video', 'notebook'))
			set @message = '錯誤'
		else if(@nC >= 500)
			set @message = '資料夾最多上限500筆資料'
		else 
			set @status = 1

		if(@status = 0 or not exists(select * from vd_VListNew where cid = @cid and ownerMID = @mid))begin
			set @status = 0
			return
		end

		declare @tmp table(ordinal int, id int)
		declare @instmp table(ordinal int, id int)
		declare @exists table(id int)

		
		begin try
			insert into @tmp
				select ordinal, cast(value as int) 
				from string_split(@idstr, ',', 1) 
				where value != ''
		end try
		begin catch
			select @status = 0, @message = '序列轉換出錯'
			return
		end catch

		-- 刪除重複資料
		;with t as(
			select id, min(ordinal) as minO
			from @tmp
			group by id
		)
		delete @tmp 
		from t 
		where [@tmp].id = t.id and [@tmp].ordinal > t.minO

		
		if(@mode = 'video')begin
			-- 刪除不存在的資料
			delete @tmp
			where not exists(
				select * from vd_Video_Pub where vid = [@tmp].id
			)

			-- 刪除已存在於資料夾內的影片
			delete @tmp
			output deleted.id into @exists
			where exists(select 1 from vd_VListVideo v where ownerMID = @mid and v.vListCID = @cid and [@tmp].id = v.vid and cid is null)
		end
		else begin
			delete @tmp
			where not exists(
				select * from vd_MemberClassNoteBook_New where cid = [@tmp].id and ownerMID = @mid
			)

			delete @tmp
			output deleted.id into @exists
			where exists(select 1 from vd_VListVideo v where ownerMID = @mid and v.vListCID = @cid and [@tmp].id = v.cid)
		end


		-- 選擇數量不超過500限制的影片
		insert into @instmp
			select top (500 - @nC) row_number() over (order by ordinal) + @seq, id
			from @tmp

		begin transaction 

			if(@mode = 'video') begin
				insert into CO(CID, OID, Rank)
					select @cid, id, ordinal
					from @instmp 
			end
			else begin
				insert into CRel(PCID, CCID, Rank)
					select @cid, id, ordinal
					from @instmp 
			end
			
			set @nC = (select count(*) from vd_VListVideo where vListCID = @cid and ownerMID = @mid)				

			update Class 
			set nObject = @nC + (select count(*) from vd_VListNewSubClass where ownerMID = @mid and pcid = @cid), 
				LastModifiedDT = getdate()
			where CID = @cid

			exec xp_History_New @mid, @cid, 34, 2, null, null, @sid

			declare @nIns int = (select count(*) from @instmp),
					@nExists int = (select count(*) from @exists)

			declare @messageTable table(string nvarchar(255))

			insert into @messageTable
				values (iif(@nIns > 0, '成功新增' + cast(@nIns as varchar) + '筆資料', '')), 
						(iif(@nExists > 0, cast(@nExists as varchar) + '筆資料已存在', '')), 
						(iif(@nC >= 500, '資料夾最多上限500筆資料', ''))

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