CREATE   procedure [dbo].[xp_IT108_Move_pList]
	@itMID int,
	@mid int,
	@sid int
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try		
		drop table if exists #tmp_Move_pList

		select CName, CDes 
		into #tmp_Move_pList
		from [IT108].EDU_Technology.dbo.vd_NotePlaylist 
		where mid = @itMID and bDel = 0

		drop table if exists #tmp_Move_pListNote

		select CName, VideoID, CurrentTime, Rank
		into #tmp_Move_pListNote
		from [IT108].EDU_Technology.dbo.vd_NotePlaylistActive 
		where OwnerMID = @itMID and bHide = 0


		begin transaction　 		
			declare @cname nvarchar(255), @cdes nvarchar(4000), @VideoID nvarchar(255), @startTime float
			
			while(exists (select * from #tmp_Move_pList)) begin
				select top 1 @cname = CName, @cdes = CDes 
				from #tmp_Move_pList 

				exec [xp_insertpList] @cname, @cdes, 1, @mid, @sid, 0, 0
				
				delete #tmp_Move_pList where CName = @cname
			end

			declare @vid int, @nid int, @plistCID int 

			while(exists (select * from #tmp_Move_pListNote)) begin
				select top 1 @cname = CName, @VideoID = videoID, @startTime = CurrentTime
				from #tmp_Move_pListNote
				order by Rank

				set @plistCID = (
					select cid from vd_MemberClasspList
					where mid = @mid and vListName = @cname
				)

				set @vid = (
					select vid from vd_Video_Pub where videoID = @VideoID
				)

				set @nid = (
					select nid from vd_Note where ownerMID = @mid and startTime = @startTime and vid = @vid
				)

				exec [xp_insertPListNote] @pListcid, @nid, @mid, @sid, 0, 0
				
				delete #tmp_Move_pListNote where CName = @cname and Videoid = @videoID and CurrentTime = @startTime
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
	set xact_abort off
end