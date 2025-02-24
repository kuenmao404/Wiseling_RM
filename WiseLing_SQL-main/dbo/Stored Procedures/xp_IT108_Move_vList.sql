CREATE   procedure [dbo].[xp_IT108_Move_vList]
	@itMID int,
	@mid int,
	@sid int
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try		
		drop table if exists #tmp_Move_vList

		select CName, CDes 
		into #tmp_Move_vList
		from [IT108].EDU_Technology.dbo.vd_MemberToCollect 
		where mid = @itMID and bDel = 0

		drop table if exists #tmp_Move_vListSection

		select PLName, iif(Section = '', '預設段落', Section) as Section, cRank
		into #tmp_Move_vListSection
		from [IT108].EDU_Technology.dbo.vd_VideoPlaylistSection 
		where OwnerMID = @itMID and bDel != 1

		drop table if exists #tmp_Move_vListSectionVideo

		select PLName, iif(Section = '', '預設段落', Section) as Section, Rank, CDes as VideoID
		into #tmp_Move_vListSectionVideo
		from [IT108].EDU_Technology.dbo.vd_VideoPlaylistVideos 
		where OwnerMID = @itMID and MG = 0


		begin transaction　 		
			declare @cname nvarchar(255), @cdes nvarchar(4000), @section nvarchar(255), @cRank int,
					@VideoID nvarchar(255), @rank int
			
			while(exists (select * from #tmp_Move_vList)) begin
				select top 1 @cname = CName, @cdes = CDes 
				from #tmp_Move_vList 

				exec [xp_insertVList] @cname, @cdes, 1, @mid, @sid, 0, 0
				
				delete #tmp_Move_vList where CName = @cname
			end

			declare @vlistcid int, @paragraphCID int, @vid int

			while(exists (select * from #tmp_Move_vListSection)) begin
				select top 1 @cname = PLName, @section = Section 
				from #tmp_Move_vListSection
				order by cRank

				set @vlistcid = (
					select cid from vd_MemberClassVList
					where mid = @mid and vListName = @cname
				)

				exec xp_insertVListParagraph @vlistcid, @section, @mid, @sid, 0, 0
				
				delete #tmp_Move_vListSection where PLName = @cname and Section = @section
			end

			while(exists (select * from #tmp_Move_vListSectionVideo)) begin
				select top 1 @cname = PLName, @section = Section, @VideoID = VideoID 
				from #tmp_Move_vListSectionVideo
				order by Rank

				set @vlistcid = (
					select cid from vd_MemberClassVList
					where mid = @mid and vListName = @cname
				)
				set @paragraphCID = (
					select paragraphCID from vd_VListParagraph
					where cid = @vlistcid and paragraphName = @section
				)
				set @vid = (
					select vid from vd_Video_Pub where videoID = @VideoID
				)

				exec [xp_insertVListVideo] @vlistcid, @paragraphCID, @vid, @mid, @sid, 0, 0
				
				delete #tmp_Move_vListSectionVideo where PLName = @cname and Section = @section and VideoID = @VideoID
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