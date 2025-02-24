CREATE   procedure [dbo].[xp_insReport]
	@oid int,  -- 影片|討論
	@title nvarchar(255),
	@des nvarchar(4000),
	@path nvarchar(max),
	@mid int,
	@sid int,
	@status bit output,
	@message nvarchar(255) output,
	@mailTitle nvarchar(255) output,
	@mailContent nvarchar(max) output
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try
		select @status = 0, @message = 'id不符', @mailTitle = '', @mailContent = ''
		
		if(@oid is not null and not (exists(select * from vd_Video_Pub where vid = @oid) or exists(select * from vd_Problem where pid = @oid)))
			return

		if(@mid = 0) begin
			set @message = '登入後才能回報'
			return
		end

		declare @date datetime = getdate()

		if((select count(*) from Report where bDel = 0 and Since <= @date and Since >= dateadd(minute, -30, @date)) >= 5) begin
			set @message = '30分鐘內回報次數不能超過5次'
			return
		end

		if(@path is null and @oid is null)begin
			set @message = '無效回報'
			return
		end

		begin transaction　
			declare @reportObject int = (select EID from Entity where CName = '回報物件'),
					@reportPage int = (select EID from Entity where CName = '回報頁面'),
					@rid int

			insert into Report(Type, MID, Tittle, Des, Path) 
				values(iif(@oid is null, @reportPage, @reportObject), @mid, @title, @des, @path)

			set @mailTitle = '回報 - 頁面' +  @path
			set @mailContent = '路徑：'  +  @path + char(10) + char(10)

			set @rid = SCOPE_IDENTITY()

			if(@oid is not null) begin
				insert into RO(RID, OID)
					values(@rid, @oid)

				declare @type int, @objectTitle nvarchar(255) 
				select @objectTitle = cname, @type = type 
				from Object where OID = @oid and type in (18, 20)

				set @mailTitle = '回報 - ' + iif(@type = 18, '影片', '題目') + cast(@oid as varchar)

				set @mailContent =  'ID：' + cast(@oid as varchar) + char(10) +
								iif(@type = 18, '影片', '題目') + '：' + @objectTitle + char(10) +
								'路徑：' + iif(@type = 18, '/watch?v=', '/problem/') + cast(@oid as varchar) + char(10) + char(10)
			end

			
			select @mailContent += (
					'會員編號：' + cast(mid as varchar) + char(10) +
					'會員名稱：' + Name + char(10) +
					'SSO：' + sso + char(10) +
					'EMail：' + EMail + char(10) + 
					'-------------------------------------------' + char(10) +
					'回報編號：' + cast(@rid as varchar) + char(10) +
					'回報標題：' + @title + char(10) +
					'回報內容：' + @des + char(10)
				)
			from vs_Member
			where MID = @mid

			select @status = 1, @message = '回報成功'

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