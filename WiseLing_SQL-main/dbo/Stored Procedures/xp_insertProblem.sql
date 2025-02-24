CREATE   procedure [dbo].[xp_insertProblem]
	@cid int,
	@title nvarchar(255),
	@statement nvarchar(4000),
	@in_spec nvarchar(4000), 
	@out_spec nvarchar(4000), 
	@sample_tests nvarchar(4000), 
	@hints nvarchar(4000),
	@tagIDstr nvarchar(4000), 
	@langIDstr nvarchar(4000),
	@difficulty int = 1, 
	@time_limit int = 1000,
	@mem_limit int = 256,
	@mid int,
	@sid int,
	@pid int output,
	@status bit output,
	@message nvarchar(255) output
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	select @status = 0, @message = '錯誤'
	begin try
		declare @problemtype int = (select EID from Entity where CName = '題目')

		if not exists(select * from vd_JudgeRootNext where CID = @cid and type = @problemtype) begin
			select @message = 'id不符'
			return
		end
			
		declare @tag table(ordinal int, cid int)

		begin try
			insert into @tag(ordinal, cid)
				select ordinal, v.cid
				from string_split(@tagIDstr, ',', 1) s, vd_AlgorithmTag v
				where value != '' and cast(value as int) = v.cid
		end try
		begin catch
			set @message = '序列轉換出錯'
			return
		end catch

		declare @lang table(id int)

		begin try
			insert into @lang(id)
				select v.plid
				from string_split(@langIDstr, ',', 1) s, vd_PLanguage_Pub v
				where value != '' and cast(value as int) = v.plid
		end try
		begin catch
			set @message = '序列轉換出錯'
			return
		end catch

		begin transaction　

			insert into Object(type, CName)
				values(@problemtype, @title) 

			set @pid = scope_identity()

			insert into Problem(pid, Difficulty, Statement, In_spec, Out_spec, Sample_tests, Hints, Time_limit, Mem_limit)
				values (@pid, @difficulty, @Statement, @In_spec, @Out_spec, @sample_tests, @hints, @time_limit, @mem_limit)

			declare @pcid int =  (select CID from Class where type = @problemtype and nLevel = 2),
					@classid int

			exec xp_insertClass @pcid, @problemtype, @pid, null, null, null, @mid, @classid output

			exec xp_insertClass @classid, 31, '範例程式', null, null, null, null, 0
			exec xp_insertClass @classid, 30, '測資', null, null, null, null, 0
			exec xp_insertClass @classid, 32, '解題紀錄', null, null, null, null, 0

			declare @cidForum int
			exec xp_insertClass @classid, 33, '討論區', null, null, null, null, @cidForum output
			
			insert into Permission(CID, PermissionBits, RoleID, RoleType)
				values(@cidForum, 7, 2, 0)

			update Problem set ClassID = @classid where PID = @pid

			insert into ORel (OID1, OID2)
				select @pid, id from @lang

			insert into CO(CID, OID, Rank)
				select cid, @pid, ordinal from @tag

			insert into OC(CID, OID, Rank)
				select cid, @pid, ordinal from @tag

			select @status = 1, @message = '新增成功'

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