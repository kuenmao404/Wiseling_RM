CREATE   procedure [dbo].[xp_solveJudgeProblem]
	@pid int, 
	@plid int,
	@code nvarchar(max),
	@statusCode int,
	@runTime int,
	@memory int,
	@kind nvarchar(255),
	@errMessage nvarchar(max),
	@bFile bit,
	@mid int,
	@sid int
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try

		declare @cid int = (select cid from vd_ClassMemberNext where MID = @mid and type = 32)

		declare @cid_p int = (select cid from vd_ClassProblem where type = 32 and pid = @pid)


		begin transaction　
			declare @JKID int = (select JKID from JudgeKind where Kind = @kind),
					@bAccept bit = iif(@statusCode = 200, 1, 0)

			set @errMessage = iif(@bAccept = 1, null, @errMessage)
			if(@JKID is null and @kind is not null) begin
				insert into JudgeKind(Kind, Type)
					values(@kind, case @statusCode when 200 then 0 when 201 then 1 else 2 end )

				set @JKID = SCOPE_IDENTITY()
			end

			declare @md5 nvarchar(32) = dbo.fs_getMD5Encode(@code)

			declare @JSID int, @SolutionID int = (select sid from Solution where MD5 = @md5)

			if(@SolutionID is null) begin
				insert into Solution(Text, MD5)
					values(@code, @md5)

				set @SolutionID = SCOPE_IDENTITY()
			end

			insert into JudgeSolve(PID, SID, OwnerMID, JKID, bAccept, PLID, RunTime, Memory, ErrMessage, bFile)	
				values(@pid, @SolutionID, @mid, @JKID, @bAccept, @plid, @RunTime, @Memory, @errMessage, @bFile)

			update Problem set nSubmit += 1
			where PID = @pid

			set @JSID = SCOPE_IDENTITY()

			insert into CJS(CID, JSID)
				values(@cid, @JSID), (@cid_p, @JSID)

			declare @my_course table(CourseCID int, CourseSolveCID int)

			-- 取得當下有這部題目的會員所有課程
			insert into @my_course (CourseCID, CourseSolveCID)
				select v.cid, n.cid
				from vd_MemberClassCourse v, vd_CourseNext n
				where v.mid = @mid and exists(
					select * from vd_CourseChapterItem cv 
					where cv.courseCID = v.cid and cv.oid = @pid and cv.c_hide = 0	and type = 20
				)  and v.cid = n.courseCID and n.Type = 32
			

			update c
			set bAccept = iif(bAccept = 1, 1, @bAccept), 
					LastModifiedDT = getdate(), AcceptSince = isnull(AcceptSince, iif(@bAccept = 1, getdate(), null)),
					JSID = iif(bAccept = 1 and @bAccept = 0, JSID, @JSID), 
					nSubmit +=  1,
					nFirstAccSubmit = iif(bAccept = 0 and @bAccept = 1, nSubmit + 1, nFirstAccSubmit)
			from CourseProblemMStatus c, @my_course t
			where c.CID = t.CourseSolveCID and c.PID = @pid and c.MID = @mid
			
			insert into CourseProblemMStatus(CID, PID, MID, bAccept, AcceptSince, JSID, nSubmit, nFirstAccSubmit)
				select CourseSolveCID, @pid, @mid, @bAccept, iif(@bAccept = 1, getdate(), null), @JSID, 1, iif(@bAccept = 1, 1, null)
				from @my_course t
				where not exists(
					select * from CourseProblemMStatus c
					where c.CID = t.CourseSolveCID and c.PID = @pid and c.MID = @mid
				)

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