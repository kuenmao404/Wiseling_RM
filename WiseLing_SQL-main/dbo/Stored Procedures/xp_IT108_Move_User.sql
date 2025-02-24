CREATE   procedure [dbo].[xp_IT108_Move_User]
	@mid int,
	@sid int,
	@status bit output,
	@message nvarchar(255) output
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try

		select @status = 0, @message = '轉移錯誤'

		declare @site nvarchar(50), @nOutlink int, @email nvarchar(max)
		
		select @site = sso, @nOutlink = O.nOutlinks, @email = EMail 
		from Object O, vs_Member v
		where OID = @mid and o.OID = v.MID
		
		if(@nOutlink = 1) begin
			select @status = 1, @message = '會員已轉移'
			return
		end

		declare @IT108MID int, @since datetime
		if(@site = 'wkesso') begin
			select top 1 @IT108MID = oid, @since = since from IT108.EDU_Technology.dbo.vd_Member where EDes = 'WKE SSO' and Email = @email
		end
		else if(@site = 'google') begin
			select top 1 @IT108MID = oid, @since = since from IT108.EDU_Technology.dbo.vd_Member where EDes = 'Google' and Email = @email
		end

		if(@IT108MID is null) begin
			select @status = 1, @message = '會員無需轉移資料'
			return
		end


		begin transaction　

			exec xp_IT108_Move_Note @IT108MID, @mid, @sid
			exec [xp_IT108_Move_vList] @IT108MID, @mid, @sid
			exec [xp_IT108_Move_pList] @IT108MID, @mid, @sid

			update Object set nOutlinks = 1, since = @since where OID = @mid

			set @status = 1
			set @message = '轉移成功'
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