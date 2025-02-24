CREATE   procedure [dbo].[xp_updateForum&Tag]
	@fid int,
	@title nvarchar(255),
	@text nvarchar(max),
	@tag nvarchar(300),
	@mid int,
	@sid int,
	@status bit output,
	@message nvarchar(255) output
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try
		select @status = 0, @message = '錯誤'

		exec xp_checkStringLimit @tag, 255, 1, 'Tag總長度', @status output, @message output

		-- tags
		declare @tmp table(sno int, tag_str nvarchar(255) COLLATE Chinese_Taiwan_Stroke_CS_AS, TID int)
		declare	@tags_t nvarchar(max) = @tag COLLATE Chinese_Taiwan_Stroke_CS_AS

		insert into @tmp (sno, tag_str)
			select ordinal, value 
			from string_split(@tag, ' ', 1)
			where value != ''

		if exists(select tag_str, count(*) from @tmp group by tag_str having count(*) > 1)
			select @status = 0, @message = '不可包含重複Tag'
		else if(exists (select * from @tmp where len(tag_str) > 32)) 
			select @status = 0, @message = '單一Tag超過長度限制32個字'
		
		if(@status = 0)
			return

		exec xp_updateForum @fid, @title, @text, @mid, @sid, @status output, @message output

		if(@status = 0)
			return

		begin transaction
			
			insert into Tag(Text)
				select t.tag_str 
				from @tmp t
				where not exists(select * from Tag tt where t.tag_str = tt.Text)

			update t set TID = tt.TID
			from @tmp t, Tag TT
			where t.tag_str = tt.Text

			declare @o_c int = (select count(*) from FT where FID = @fid),
				@same_c int = (
					select  count(*) 
					from @tmp t, FT
					where t.TID = FT.TID and FT.FID = @fid
				),
				@tmp_c int = (select count(*) from @tmp)

			delete TF 
			from FT
			where FT.FID = @fid and FT.TID = TF.TID and TF.FID = @fid

			delete FT where FID = @fid

			insert into FT(FID, TID, Rank)
				select @fid, TID, sno
				from @tmp 

			insert into TF(FID, TID, Rank)
				select @fid, TID, sno
				from @tmp 

			update Tag
			set nF = (select count(*) from vd_TF TF where TF.TID = Tag.TID)
			from FT
			where FT.FID = @fid and Tag.TID = FT.TID

			if(@tmp_c != @o_c or @same_c != @o_c) begin
				update Forum set LastModifiedDT = getdate(), Tag = @tag where FID = @fid
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
		exec xp_insertLogErr @sid, @ErrorMessage, @err_number, @aid
		RAISERROR( @ErrorMessage, @ErrorSeverity, @ErrorState);--回傳錯誤資訊
	end catch
end