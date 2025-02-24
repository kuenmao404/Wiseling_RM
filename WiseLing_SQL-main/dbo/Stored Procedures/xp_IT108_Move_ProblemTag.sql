CREATE   procedure [dbo].[xp_IT108_Move_ProblemTag]
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	begin try
		
		drop table if exists #tmp

		select *
		into #tmp
		from [judge].it108.judge.vd_Tag

		declare @eid int = (select EID from Entity where CName = '標籤')

		drop table if exists #tmp_co

		select co.CID, co.OID, o.Edes as originID
		into #tmp_co
		from [judge].it108.judge.vd_Tag v, [judge].it108.judge.co co, [judge].it108.judge.vd_problem p, [judge].it108.judge.Object o
		where v.cid = co.CID and co.OID = p.pid and p.pid = o.OID


		begin transaction　 

			declare @id int,
					@cname nvarchar(max),
					@ename nvarchar(max),
					@keywords   nvarchar(max)

			while(exists(select * from #tmp)) begin

				select top 1 @id = cid, @cname = cname, @keywords = keywords, @ename = ename
				from #tmp

				declare @cid int = (select CID from vd_AlgorithmTag where CName = @cname),
						@pcid int = (select cid from vd_RootTagNext where CName = '演算法')

				if(@cid is null) begin
					
					exec xp_insertClass @pcid, @eid, @cname, null, null, null, null, @cid output
				end
				else begin
					
					
					delete CO where CID = @cid
					delete OC where CID = @cid

				end

				
				insert into CO(CID, OID)
					select @cid, v.pid
					from #tmp_co t, vd_Problem v
					where t.CID = @id and t.originID = v.originID
					group by v.pid
					
				insert into OC(CID, OID)
					select @cid, v.pid
					from #tmp_co t, vd_Problem v
					where t.CID = @id and t.originID = v.originID
					group by v.pid

				update Class 
				set	EName = @ename,
					Keywords = @keywords, 
					nObject = (select count(*) from CO where CID = @cid) 
				where CID = @cid
				

				delete #tmp where cid = @id
			end

			update Problem set Keywords = v.keys
			from(
				select v.pid, v.title, v.difficulty, STRING_AGG(a.CName + a.EName + a.Keywords, ',') 'keys'
				from vd_Problem v, OC, vd_AlgorithmTag a
				where v.pid = oc.OID and oc.CID = a.CID
				group by v.pid, v.title, v.difficulty
			) v
			where Problem.PID = v.pid
			

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