CREATE   procedure [dbo].[xp_insertClassForum]
	@id int,
	@cid int,
	@fid int,
	@title nvarchar(255),
	@text nvarchar(max),
	@mid int,
	@sid int,
	@status bit output,
	@message nvarchar(255) output,
	@fid_out int output
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try
		select @status = 1, @message = 'id不符'

		declare @bCourse bit = 0, @bProblem bit = 0, @bTitleAllowNull bit = 1

		if exists(select * from vd_CourseNext where courseCID = @id and type = 33 and cid = @cid) 
			set @bCourse = 1
		else if exists(select * from vd_ClassProblem where pid = @id and type = 33 and cid = @cid) begin
			select @bProblem = 1, @bTitleAllowNull = 0
		end

		if(@bCourse = 0 and @bProblem = 0) 
			set @status = 0
		
		if(@fid is not null) begin
			set @bTitleAllowNull = 1
			if not exists(select * from vd_ClassForum where cid = @cid and fid = @fid)
				set @status = 0
		end

		if(@status = 0)
			return
			

		exec [xp_insertForum] @fid, @title, @bTitleAllowNull, @text, @mid, @sid, @fid_out output, @status output, @message output

		if(@status = 0)
			return

		begin transaction

			if(@fid is null) begin
				insert into CF(CID, FID)
					values(@cid, @fid_out)

				update Class 
				set nObject = (select COUNT(*) from vd_ClassForum where cid = @cid)
				where CID = @cid
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