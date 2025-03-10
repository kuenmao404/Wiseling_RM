﻿CREATE   procedure [dbo].[xp_updateNote]
	@vid int,
	@cid int,
	@nid int,
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
	begin try
		select @status = 0, @message = 'id不符'

		if not exists(select * from vd_MemberNoteClass_Front where MID = @mid and CID = @cid and VID = @vid and nid = @nid) begin
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
			where mid = @mid and cid = @cid and vid = @vid and nid != @nid and cast(startTime as int) = cast(@startTime as int)) 
		begin
			set @message = '已存在筆記於相近時間點'
			return
		end

		if exists(
			select * 
			from vd_MemberNoteClass_Front 
			where mid = @mid and cid = @cid and vid = @vid and nid != @nid
				and cast(startTime as int) <= cast(@startTime as int) and cast(endTime as int) >= cast(@endTime as int)
			)
		begin
			set @message = '該時區間內已存在筆記'
			return
		end

		declare @bUpdate bit = 1

		if exists(
			select * 
			from Note 
			where vid = @vid and nid = @nid and OwnerMID = @mid
				and startTime = @startTime and isnull(endTime, 1) = isnull(@endTime, 1) 
				and bDel = 0
		) begin
			set @bUpdate = 0
		end

		begin transaction　[xp_updateNote]
			
			declare @old_ntid int = (select ContentNTID from Note where NID = @nid and OwnerMID = @mid and VID = @vid)

			declare @md5 nvarchar(32) = dbo.fs_getMD5Encode(@content)

			declare @ntid int = (select ntid from NText where MD5 = @md5)

			if(@ntid is null) begin

				insert into NText(Text, MD5, Length)
					values(@content, @md5, len(@content))

				set @ntid = SCOPE_IDENTITY()
			end

			set @bUpdate = iif(@old_ntid != @ntid, 1, @bUpdate)

			update Note set ContentNTID = @ntid, LastModifiedDT = iif(@bUpdate = 1, getdate(), LastModifiedDT),
							StartTime = @startTime, EndTime = @endTime
			where NID = @nid and OwnerMID = @mid and VID = @vid

			update Class set LastModifiedDT = iif(@bUpdate = 1, getdate(), LastModifiedDT) where CID = @cid

			if(@bUpdate = 1)
				exec xp_History_new @mid, @nid, 5, 2, @duration, @ntid, @sid

			select @status = 1, @message = '編輯成功'
		commit transaction	[xp_updateNote]
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction [xp_updateNote]
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