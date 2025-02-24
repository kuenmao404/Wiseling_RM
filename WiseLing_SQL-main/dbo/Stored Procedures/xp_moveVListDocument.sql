CREATE   procedure [dbo].[xp_moveVListDocument]
	@pcid int,
	@cid int,
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
		declare @P_nlevel int, @P_idpath nvarchar(max), 
				@o_pcid int = dbo.[fn_getClassPCID](@cid),
				@maxnLevel int = (select max(nLevel) - 3 from fn_getChildClassWithParent(@cid)),
				@vListName nvarchar(255), @nlevel int, @idpath nvarchar(max)
				
		select @vListName = vListName, @nlevel = nlevel, @idpath = idpath
		from vd_VListNew 
		where cid = @cid and ownerMID = @mid

		select @P_nlevel = nlevel, @P_idpath = idpath
		from vd_VListNew 
		where cid = @pcid and ownerMID = @mid
			

		if(@P_nlevel is null or @maxnLevel is null or @nlevel is null)
			set @message = 'id不符'
		else if(@P_nlevel = 5) 
			set @message = '超過層數限制'
		else if(@P_nlevel + (@maxnLevel - @nlevel + 1)  > 5)
			set @message = '移動後超過層數限制'
		else if(@pcid = @cid)
			set @message = '無法移動到自身'
		else if(@P_idpath like @idpath + '%')
			set @message = '無法移動到自身底下子資料夾'
		else if exists(select * from vd_VListNewSubClass where pcid = @pcid and vListName = @vListName)
			set @message = '資料夾名稱重複無法移動'
		else
			set @status = 1

		if(@status = 0)
			return


		begin transaction　

			declare @seq int = (select isnull(max(rank) + 1, 0) from vd_VListNewSubClass where ownerMID = @mid and pcid = @pcid)
			
			exec xp_moveClass @cid, @pcid
			
			update Inheritance set Rank = @seq
			where PCID = @pcid and ccid = @cid

			update Class set nObject += 1 
			where CID = @pcid

			update Class set nObject -= 1
			where CID = @o_pcid

			set @status = 1
			set @message = '移動成功'
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