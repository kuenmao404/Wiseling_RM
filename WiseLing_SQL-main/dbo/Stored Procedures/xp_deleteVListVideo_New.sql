CREATE procedure [dbo].[xp_deleteVListVideo_New]
	@cid int,  -- 資料夾cid
	@notebookCIDstr nvarchar(4000),
	@vidstr nvarchar(4000),
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

		declare @videotype int = (select EID from Entity where CName = '影片')
		
		if not exists(
			select * from vd_VListNew where cid = @cid and ownerMID = @mid
		)begin
			set @message = 'id不符'
			return
		end	

		declare @vtmp table(id int)
		declare @ntmp table(id int)

		begin try
			insert into @vtmp(id)
				select cast(value as int) 
				from string_split(@vidstr, ',') 
				where value != ''

			insert into @ntmp(id)
				select cast(value as int) 
				from string_split(@notebookCIDstr, ',') 
				where value != ''
		end try
		begin catch
			set @message = '序列轉換出錯'
			return
		end catch

		begin transaction 

			delete CO 
			from @vtmp t, vd_Video_Pub v
			where CID = @cid and OID = t.id and t.id = v.vid

			delete CRel 
			from @ntmp t, vd_MemberClassNoteBook_New v
			where PCID = @cid and CCID = t.id and v.ownerMID = @mid and t.id = v.cid

			update Class 
			set nObject = (select count(*) from vd_VListVideo where vListCID = @cid and ownerMID = @mid) + 
						(select count(*) from vd_VListNewSubClass where pcid = @cid and ownerMID = @mid),
				LastModifiedDT = getdate()
			where CID = @cid

			select @status = 1, @message = '刪除成功'
			
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