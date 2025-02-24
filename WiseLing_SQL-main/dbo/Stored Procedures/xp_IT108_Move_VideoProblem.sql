CREATE   procedure [dbo].[xp_IT108_Move_VideoProblem]
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	begin try
		
		drop table if exists #tmp

		select v.*, o.Edes as originID
		into #tmp
		from [judge].it108.judge.video2problem v,  [judge].it108.judge.vd_problem p, [judge].it108.judge.Object o
		where v.problem_id = p.pid and p.pid = o.OID

		begin transaction　
		
			delete ORel
			from (
				select o.OID1, o.OID2
				from vd_Video_Pub v, ORel o, vd_Problem p
				where v.vid = o.OID1 and o.OID2 = p.pid
			)v
			where ORel.OID1 = v.OID1 and ORel.OID2 = v.OID2


			insert into ORel(OID1, OID2)
				select v.vid, p.pid
				from #tmp t, vd_Video_Pub v, vd_Problem p
				where t.video_id = v.videoID and t.originID = p.originID


			update Object set nOutlinks = (select count(*) from ORel where OID1 = Object.OID)
			from vd_Video_Pub v
			where v.vid = Object.OID

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