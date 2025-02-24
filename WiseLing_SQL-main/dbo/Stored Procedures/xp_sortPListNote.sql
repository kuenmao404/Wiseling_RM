CREATE   procedure [dbo].[xp_sortPListNote]
	@cid int,
	@sortstr nvarchar(512),
	@mid int,
	@sid int,
	@status bit output,
	@message nvarchar(max) output
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try
		select @status = 0, @message = 'ID不符'

		if not exists(select * from vd_PList where cid = @cid)begin
			return
		end

		declare @tmp table(ordinal int, id int)

		begin try
			insert into @tmp(ordinal, id)
				select ordinal, cast(value as int) 
				from string_split(@sortstr, ',', 1) 
				where value != ''
				order by ordinal
		end try
		begin catch
			set @message = '序列轉換出錯'
			return
		end catch
		
		declare @count int = (select count(*) from vd_PListNote where cid = @cid),
				@count_t int = (select count(*) from @tmp),
				@count_join int = (
					select count(*) 
					from vd_PListNote v, @tmp t
					where v.cid = @cid and v.nid = t.id
				)

		if(not (@count = @count_t and @count_join = @count_t) or exists(select top 1 * from @tmp group by id having count(*) > 1)) begin
			set @message = '序列ID不符'
			return
		end

		begin transaction　[xp_sortPListNote]
			
			update CN set Rank = t.ordinal 
			from @tmp t
			where CN.CID = @cid and CN.NID = t.id

			select @status = 1, @message = '排序隨選播放清單內筆記成功' 

		commit transaction	[xp_sortPListNote]
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction [xp_sortPListNote]
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