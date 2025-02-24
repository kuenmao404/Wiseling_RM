CREATE   procedure [dbo].[xp_IT108_Move_Problem]
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	begin try
		
		drop table if exists #tmp

		select v.*, o.Edes as originID
		into #tmp
		from [judge].it108.judge.vd_problem v, [judge].it108.judge.Object o
		where v.pid = o.OID

		declare @eid int = (select EID from Entity where CName = '題目')


		begin transaction　 

			declare @title nvarchar(max),
					@Difficulty int,
					@Statement   nvarchar(max),
					@In_spec   nvarchar(max),
					@Out_spec   nvarchar(max),
					@Sample_tests   nvarchar(max),
					@Hints   nvarchar(max),
					@Time_limit   int,
				   @Mem_limit    int,
					@originID nvarchar(32)

			while(exists(select * from #tmp)) begin
				declare @id int

				select top 1 @id = pid, @title = ltrim(title), @Difficulty = Difficulty,
					@Statement = Statement, @In_spec = In_spec, @Out_spec = Out_spec, @Sample_tests = Sample_tests,
					@Hints = Hints, @Time_limit = Time_limit, @Mem_limit = Mem_limit, @originID = originID
				from #tmp

				declare @pid int = (select pid from vd_Problem where originID = @originID)

				select @Sample_tests = replace(@Sample_tests, '"\n', '"')
				select @Sample_tests = replace(@Sample_tests, '\n"', '"')

				select @In_spec = replace(@In_spec, '\<', '<')
				select @In_spec = replace(@In_spec, '\>', '>')

				select @Out_spec = replace(@Out_spec, '\<', '<')
				select @Out_spec = replace(@Out_spec, '\>', '>')

				select @Statement = replace(@Statement, '\<', '<')
				select @Statement = replace(@Statement, '\>', '>')

				select @Hints = replace(@Hints, '\<', '<')
				select @Hints = replace(@Hints, '\>', '>')

				if(@pid is null) begin
					insert into Object(Type, CName)
						values(@eid, @title)

					set @pid = SCOPE_IDENTITY()
					

					insert into Problem(PID, Difficulty, Statement, In_spec, Out_spec, Sample_tests, Hints, Time_limit, Mem_limit, originID)
						values(@pid, @Difficulty, @Statement, @In_spec, @Out_spec, @Sample_tests, @Hints, @Time_limit, @Mem_limit, @originID)
				end
				else begin
					update Problem 
					set Difficulty = @Difficulty,
						Statement = @Statement, In_spec = @In_spec, Out_spec = @Out_spec, Sample_tests = @Sample_tests,
						Hints = @Hints, Time_limit = @Time_limit, Mem_limit = @Mem_limit
					where PID = @pid
				end

				delete #tmp where pid = @id


			end
			
			update Problem set Difficulty = 999
			where Difficulty is null

		commit transaction	
		--登入新增新的一筆MSession
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
		RAISERROR( @ErrorMessage, @ErrorSeverity, @ErrorState);--回傳錯誤資訊
	end catch
	set xact_abort off
end