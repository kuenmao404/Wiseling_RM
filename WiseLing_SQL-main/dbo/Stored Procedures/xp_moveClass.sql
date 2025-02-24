CREATE  procedure [dbo].[xp_moveClass]
	@cid int,  
	@pcid int
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	begin try
		declare @o_pcid int = dbo.fn_getClassPCID(@cid)

		declare @message nvarchar(255),
				@cname nvarchar(255),
				@idpath nvarchar(max),
				@p_idpath nvarchar(max)
				
		select @cname = cname, @idpath = IDPath from Class where CID = @cid
		select @p_idpath = IDPath from Class where CID = @pcid

		if not exists(select 1 from Class where CID = @pcid) 
			set @message = 'Error: pcid不存在無法移動Class'
		else if(@cid = @pcid) 
			set @message = 'Error: 無法移動到自己，cid與pcid相同'
		else if exists(select * from vs_SubClass where CID = @pcid and CName = @cname)
			set @message = 'Error: 名稱重複無法移動'
		else if (@p_idpath like @idpath + '%')
			set @message = 'Error: 無法移動到自身子class'


		if(@message is not null) begin
			raiserror(@message, 14, 1)
			return
		end
		
		begin transaction 
			
			update Class 
			set NamePath = v.NamePath, IDPath = v.IDPath, nLevel = v.nLevel
			from fn_moveClass(@cid, @pcid) v
			where Class.CID = v.CCID

			if(@o_pcid is null) begin
				insert into Inheritance (PCID, CCID)
					values(@pcid, @cid)
			end
			else begin
				update Inheritance 
				set PCID = @pcid
				where PCID = @o_pcid and CCID = @cid
			end
				
		commit transaction 
	end try
	begin catch
		if XACT_STATE() <> 0
		begin
			rollback transaction 
		end
		declare @ErrorMessage As VARCHAR(1000) = CHAR(10)+'錯誤代碼：' +CAST(ERROR_NUMBER() AS VARCHAR)
												+CHAR(10)+'錯誤訊息：'+	ERROR_MESSAGE()
												+CHAR(10)+'錯誤行號：'+	CAST(ERROR_LINE() AS VARCHAR)
												+CHAR(10)+'錯誤程序名稱：'+	ISNULL(ERROR_PROCEDURE(),'')
		declare @ErrorSeverity As Numeric = ERROR_SEVERITY()
		declare @ErrorState As Numeric = ERROR_STATE()
		declare @err_number int = ERROR_NUMBER()

		RAISERROR( @ErrorMessage, @ErrorSeverity, @ErrorState);--回傳錯誤資訊
	end catch
end