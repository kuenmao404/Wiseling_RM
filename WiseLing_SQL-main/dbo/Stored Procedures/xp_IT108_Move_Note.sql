CREATE   procedure [dbo].[xp_IT108_Move_Note]
	@itMID int,
	@mid int,
	@sid int
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try
		
		drop table if exists #tmp_Move_Note

		select vv.vid, '## ' + n.Title + char(10) + char(10) + replace(n.Content, 'https://it108.wke.csie.ncnu.edu.tw/filestorage/', '/assets/it108?path=') as Note, 
			n.CurrentTime as CurrentTime, n.LastModifiedDT as LastModifiedDT,
			iif(EndTime = 0, null, CurrentTime + EndTime)  'RealEndTime', 
			dbo.fs_getMD5Encode('## ' + n.Title + char(10) + char(10) + n.Content) 'md5'
		into #tmp_Move_Note
		from [IT108].EDU_Technology.dbo.Note n, [IT108].EDU_Technology.dbo.Video v, vd_Video_Pub vv
		where n.OwnerMID = @itMID and n.bDel = 0 and n.OwnerVID = v.vid and v.videoid = vv.videoID and n.NType = 0
		

		drop table if exists #tmp_distinctVID

		select distinct(vid) 'vid'
		into #tmp_distinctVID
		from #tmp_Move_Note

		declare @outNID table (nid int)

		begin transaction　 
			
			declare @cid_note int = (select CID from vd_ClassMemberNext where MID = @mid and CName = '筆記本')

			insert into NText(Text, MD5)
				select t.Note, t.md5
				from #tmp_Move_Note t
				where not exists(select * from NText n where t.md5 = n.md5)
				group by t.Note, t.md5

			while exists(select * from #tmp_distinctVID) begin
				delete @outNID
				declare @vid int = (select top 1 vid from #tmp_distinctVID)

				declare @cid_video int = (
					select top 1 CID_VID 
					from vd_MemberClassNoteVideo where MID = @mid and PCID = @cid_note and VID = @vid
				)

				

				if (@cid_video is null) begin
					declare @eid int = (select eid from Entity where CName = '筆記'),
							@vid_str int = cast(@vid as nvarchar(20))
	
					exec xp_insertClass @cid_note, @eid, @vid_str, null, null, null, @mid, @cid_video output
	
					exec xp_insertClass @cid_video, @eid, '我的筆記', null, null, null, @mid, 0
	
				end

				declare @noteCID int = (select CID from vd_MemberClassNoteBook where VID = @vid and ownerMID = @mid and CName = '我的筆記')

				insert into Note(VID, OwnerMID, StartTime, EndTime, ContentNTID, Since, LastModifiedDT)
					output inserted.NID into @outNID
					select @vid, @mid, CurrentTime, RealEndTime, n.NTID, t.LastModifiedDT, t.LastModifiedDT
					from #tmp_Move_Note t, NText n
					where t.vid = @vid and t.md5 = n.MD5

					
				insert into CN(CID, NID)
					select @noteCID, nid
					from @outNID

				insert into NC(CID, NID)
					select @noteCID, nid
					from @outNID
				
				update Class set nObject = (select count(*) from vd_MemberNoteClass_Front where mid = @mid and cid = @noteCID and vid = @vid)
				where CID = @noteCID
				
				delete #tmp_distinctVID where vid = @vid
			end


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
		exec xp_insertLogErr @sid, @ErrorMessage, @err_number, @aid
		RAISERROR( @ErrorMessage, @ErrorSeverity, @ErrorState);--回傳錯誤資訊
	end catch
	set xact_abort off
end