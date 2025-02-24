CREATE   procedure [dbo].[xp_sortVListVideo_new]
	@cid int, -- 資料夾cid
	@vid int,  
	@notebookCID int, 
	@type int,  -- 18|19 (影片|筆記本)
	@seqNum int,  -- 移動到第幾順位
	@sid int,
	@mid int,
	@status bit output,
	@message nvarchar(max) output
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	select @status = 0, @message = '錯誤'
	begin try
		
		declare @videotype int = (select EID from Entity where CName = '影片')

		if not exists(
			select 1 from vd_VListVideo 
			where vListCID = @cid and type = @type and ownerMID = @mid and vid = @vid 
			and ((@type != @videotype and cid = @notebookCID) or (@type = @videotype and cid is null)) 
		)begin
			set @message = 'id不符'
			return
		end	
			

		declare @tmp table(ordinal int, notebookCID int, vid int)

		insert into @tmp
			select row_number() over (order by rank), cid, vid
			from vd_VListVideo
			where vListCID = @cid and ownerMID = @mid

		declare @myordinal int = (select ordinal from @tmp where vid = @vid and ((@type != @videotype and notebookCID = @notebookCID) or (@type = @videotype and notebookCID is null)))

		if(@myordinal > @seqNum) begin
			update @tmp set ordinal += 1
			where ordinal between @seqNum and @myordinal - 1
		end
		else if(@myordinal < @seqNum) begin
			update @tmp set ordinal -= 1
			where ordinal between @myordinal + 1 and @seqNum
		end
		
		update @tmp set ordinal = @seqNum 
		where vid = @vid and ((@type != @videotype and notebookCID = @notebookCID) or (@type = @videotype and notebookCID is null))


		begin transaction　
			
			update CRel set Rank = t.ordinal 
			from @tmp t
			where PCID = @cid and CCID = t.notebookCID

			update CO set Rank = t.ordinal 
			from @tmp t
			where CID = @cid and OID = t.vid and t.notebookCID is null

			select @status = 1, @message = '排序成功' 

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