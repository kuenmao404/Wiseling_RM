CREATE procedure [dbo].[xp_checkSessionToken]
	@ip varchar(100),
	@uaString nvarchar(900),
	@access_cookie uniqueidentifier,
	@refresh_cookie uniqueidentifier,
	@expires int,
	@expires_refresh int,
	@buffer int,
	@access_new uniqueidentifier output,
	@refresh_new uniqueidentifier output,
	@expiredDT datetime output,
	@expiredDT_Refresh datetime output,
	@mid int output,
	@sid int output,
	@bSetCookie bit output
as
begin
	set xact_abort on
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try

		declare @nowDate datetime = getdate(), @bufferDT datetime, @o_sid int

		set @bSetCookie = 0

		-- 防呆，過期時間不能為null
		if(@expires is null or @expires_refresh is null) begin
			select @expiredDT_Refresh = @nowDate, @expiredDT = @nowDate
			return
		end

		-- 取得Access Token資訊
		select @sid = SID, @mid = MID, @access_new = AccessToken, @refresh_new = RefreshToken,
				@expiredDT = ExpiredDT, @expiredDT_Refresh = RefreshExpiredDT 
		from MSession
		where AccessToken = @access_cookie

		-- Access Token尚未過期
		if (@expiredDT > @nowDate) begin 
			return
		end

		-- 以下為Access Token無效、過期、null
		-- 重設預設值
		select @sid = null, @mid = null, @expiredDT_Refresh = null

		-- 取得refresh Token資訊
		select @o_sid = SID, @sid = RefreshSID, @mid = MID, @expiredDT_Refresh = RefreshExpiredDT, @bufferDT = BufferDT
		from MSession 
		where RefreshToken = @refresh_cookie
		
		-- 若換過證，且在緩衝時間，解決同時發送多支API卻攜帶相同舊cookie問題
		if(@sid is not null and @bufferDT > @nowDate) begin
			
			-- 取得換證後，新證資訊
			select @sid = SID, @mid = MID, @access_new = AccessToken, @refresh_new = RefreshToken,
				@expiredDT = ExpiredDT, @expiredDT_Refresh = RefreshExpiredDT 
			from MSession
			where SID = @sid

			return
		end

		-- 以下Access Token無效、過期、null，Refresh Token不再緩衝時間內、無效、過期、null
		begin transaction xp_checkSessionToken
			declare @UAID int

			-- 判斷瀏覽器版本
			set @UAID = (select UAID From UserAgent where UAString = @uaString)
		
			if(@UAID is null) begin
				insert into UserAgent(UAString) values(@uaString)
				set @UAID = SCOPE_IDENTITY()
			end

			set @bSetCookie = 1

			-- 換發新Token
			select @access_new = newid(), @refresh_new = newid()

			-- RefreshToken尚未到期
			if (@expiredDT_Refresh > @nowDate) begin

				-- 會員最後登入時間
				update Member set LastLoginDT = @nowDate where MID = @mid
			end
			-- RefreshToken過期或無效
			else begin
				set @mid = 0
			end

			-- 重設到期時間
			select @expiredDT = dateadd(second, @expires, @nowDate), @expiredDT_Refresh = dateadd(second, @expires_refresh, @nowDate)

			-- 新增新Session
			insert into MSession(MID, [IP], UserAgent, AccessToken, ExpiredDT, RefreshToken, RefreshExpiredDT)
				values(@mid, @ip, @UAID, @access_new, @expiredDT, @refresh_new, @expiredDT_Refresh)

			set @sid = SCOPE_IDENTITY()
			
			-- 舊RefreshToken，緩衝時間，新證SID設定
			update MSession 
			set BufferDT = dateadd(second, isnull(@buffer, 0), @nowDate), RefreshSID = @sid
			where SID = @o_sid
	
		commit transaction xp_checkSessionToken
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction xp_checkSessionToken
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