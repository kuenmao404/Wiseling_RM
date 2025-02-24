CREATE   procedure [dbo].[xp_sortVListDocument]
	@cid int, -- 被排序的資料夾cid
	@seqNum int, -- 移動到第幾順位
	@mid int,
	@sid int,
	@status bit output,
	@message nvarchar(max) output
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	select @status = 0, @message = '錯誤'
	begin try
		
		declare @pcid int = dbo.fn_getClassPCID(@cid)

		if not exists(select * from vd_VListNew where cid = @cid and ownerMID = @mid) begin
			set @message = 'id不符'
			return
		end

		declare @tmp table(ordinal int, id int)

		insert into @tmp(ordinal, id)
			select row_number() over (order by rank), cid
			from vd_VListNewSubClass
			where pcid = @pcid and ownerMID = @mid

		declare @myordinal int = (select ordinal from @tmp where id = @cid)

		if(@myordinal > @seqNum) begin
			update @tmp set ordinal += 1
			where ordinal between @seqNum and @myordinal - 1
		end
		else if(@myordinal < @seqNum) begin
			update @tmp set ordinal -= 1
			where ordinal between @myordinal + 1 and @seqNum
		end

		update @tmp set ordinal = @seqNum
		where id = @cid

		begin transaction　
			
			update i
			set rank = t.ordinal
			from Inheritance i, @tmp t
			where i.PCID = @pcid and i.CCID = t.id

			select @status = 1, @message = '影片收藏清單排序成功' 

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