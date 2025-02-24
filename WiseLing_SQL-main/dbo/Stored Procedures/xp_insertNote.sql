CREATE   procedure [dbo].[xp_insertNote]
	@vid int,
	@cid int,
	@startTime float,
	@endTime float,
	@content nvarchar(max),
	@duration int,
	@mid int,
	@sid int,
	@status bit output,
	@message nvarchar(max) output
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	select @status = 0, @message = '錯誤'
	begin try
		

		if not exists(select * from vd_MemberClassNoteBook_New where ownerMID = @mid and CID = @cid and VID = @vid) begin
			return
		end

		if(@startTime is null) begin
			set @message = '開始時間不能為空'
			return
		end
		
		if(@startTime > @endTime) begin
			set @message = '結束時間不得小於開始時間'
			return
		end

		if exists(
			select * 
			from vd_MemberNoteClass_Front 
			where mid = @mid and cid = @cid and vid = @vid and cast(startTime as int) = cast(@startTime as int))
		begin
			set @message = '已存在筆記於相近時間點'
			return
		end

		if exists(
			select * 
			from vd_MemberNoteClass_Front 
			where mid = @mid and cid = @cid and vid = @vid 
				and cast(startTime as int) <= cast(@startTime as int) and cast(endTime as int) >= cast(@endTime as int)
			)
		begin
			set @message = '該時區間內已存在筆記'
			return
		end

		begin transaction　[xp_insertNote]
			
			declare @md5 nvarchar(32) = dbo.fs_getMD5Encode(@content)

			declare @ntid int = (select ntid from NText where MD5 = @md5)

			if(@ntid is null) begin

				insert into NText(Text, MD5, Length)
					values(@content, @md5, len(@content))

				set @ntid = SCOPE_IDENTITY()
			end

			declare @nid int 

			insert into Note(VID, OwnerMID, StartTime, EndTime, ContentNTID)
				values(@vid, @mid, @startTime, @endTime, @ntid)

			set @nid = SCOPE_IDENTITY()

			insert into NC(NID, CID)
				values(@nid, @CID)

			insert into CN(NID, CID)
				values(@nid, @CID)

			update Class set nObject = (select count(*) from vd_MemberNoteClass_Front where mid = @mid and cid = @cid and vid = @vid)
			where CID = @cid

			exec xp_History_New @mid, @nid, 5, 0, @duration, @ntid, @sid

			select @status = 1, @message = '新增成功'
		commit transaction	[xp_insertNote]
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction [xp_insertNote]
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
GO
EXECUTE sp_addextendedproperty @name = N'DS_xp_insertNote_@vid', @value = N'Video.VID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'PROCEDURE', @level1name = N'xp_insertNote', @level2type = N'PARAMETER', @level2name = N'@vid';


GO
EXECUTE sp_addextendedproperty @name = N'DS_xp_insertNote_@status', @value = N'回傳成功與否', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'PROCEDURE', @level1name = N'xp_insertNote', @level2type = N'PARAMETER', @level2name = N'@status';


GO
EXECUTE sp_addextendedproperty @name = N'DS_xp_insertNote_@startTime', @value = N'筆記開始時間', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'PROCEDURE', @level1name = N'xp_insertNote', @level2type = N'PARAMETER', @level2name = N'@startTime';


GO
EXECUTE sp_addextendedproperty @name = N'DS_SL_xp_insertNote_@startTime', @value = N'', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'PROCEDURE', @level1name = N'xp_insertNote', @level2type = N'PARAMETER', @level2name = N'@startTime';




GO
EXECUTE sp_addextendedproperty @name = N'DS_xp_insertNote_@sid', @value = N'MSession.SID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'PROCEDURE', @level1name = N'xp_insertNote', @level2type = N'PARAMETER', @level2name = N'@sid';


GO
EXECUTE sp_addextendedproperty @name = N'DS_xp_insertNote_@mid', @value = N'Member.MID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'PROCEDURE', @level1name = N'xp_insertNote', @level2type = N'PARAMETER', @level2name = N'@mid';


GO
EXECUTE sp_addextendedproperty @name = N'DS_xp_insertNote_@message', @value = N'訊息', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'PROCEDURE', @level1name = N'xp_insertNote', @level2type = N'PARAMETER', @level2name = N'@message';


GO
EXECUTE sp_addextendedproperty @name = N'DS_xp_insertNote_@endTime', @value = N'筆記結束時間', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'PROCEDURE', @level1name = N'xp_insertNote', @level2type = N'PARAMETER', @level2name = N'@endTime';


GO
EXECUTE sp_addextendedproperty @name = N'DS_SL_xp_insertNote_@endTime', @value = N'', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'PROCEDURE', @level1name = N'xp_insertNote', @level2type = N'PARAMETER', @level2name = N'@endTime';




GO
EXECUTE sp_addextendedproperty @name = N'DS_xp_insertNote_@content', @value = N'Markdown', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'PROCEDURE', @level1name = N'xp_insertNote', @level2type = N'PARAMETER', @level2name = N'@content';


GO
EXECUTE sp_addextendedproperty @name = N'DS_xp_insertNote_@cid', @value = N'Class.CID (筆記)', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'PROCEDURE', @level1name = N'xp_insertNote', @level2type = N'PARAMETER', @level2name = N'@cid';

