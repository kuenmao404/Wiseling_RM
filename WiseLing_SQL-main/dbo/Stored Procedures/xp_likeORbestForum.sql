CREATE   procedure [dbo].[xp_likeORbestForum]
	@pfid int,
	@fid int,
	@mode int, -- 1|2 (like|best)
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
		
		if not exists(select * from Forum where FID = @fid) begin
			return
		end

		if(@pfid is not null and not exists(select * from vd_ForumChild where pfid = @pfid and fid = @fid))
			return

		declare @p_ownermid int = (select mid from Forum where FID = @pfid)

		-- 變更最佳子討論，只能是該討論Owner
		if(@mode = 2 and @p_ownermid != @mid) begin
			return
		end

		begin transaction　

			if(@mode = 1) begin

				if exists(select * from MF where MID = @mid and FID = @fid) begin
					delete MF where  MID = @mid and FID = @fid
					delete FM where  MID = @mid and FID = @fid
				end
				else begin
					declare @date datetime = getdate()

					insert into MF(MID, FID, Since)
						values(@mid, @fid, @date)

					insert into FM(MID, FID, Since)
						values(@mid, @fid, @date)
				end

				update Forum set nLike = (select count(*) from FM where FID = @fid)
				where FID = @fid
				
			end
			else if(@mode = 2) begin
				
				declare @best_fid int = (select fid from vd_ForumChild where pfid = @pfid and bBest = 1)

				-- 未有最佳
				if(@best_fid is null) begin
					update Forum set bBest = 1
					where FID = @fid
				end
				-- 有最佳且相同，true false轉換
				else if(@best_fid is not null and @best_fid = @fid) begin
					update Forum set bBest = iif(bBest = 1, 0, 1)
					where FID = @fid
				end
				-- 有最佳但不同
				else if(@best_fid is not null and @best_fid != @fid) begin
					update Forum set bBest = 1
					where FID = @fid

					update Forum set bBest = 0
					where FID = @best_fid
				end
			end


			select @status = 1, @message = '成功' 

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