CREATE   procedure [dbo].[xp_signIn_sso]
	@uid nvarchar(512),
	@account nvarchar(512),
	@name nvarchar(255),
	@email nvarchar(255),
	@site nvarchar(255),
	@pic nvarchar(3000),
	@sid int,
	@status bit output,
	@message nvarchar(255) output,
	@bNeedMoveIT108 bit output
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try
		declare @newDate datetime = getdate(), @mid int

		select @status = 0, @message = '登入錯誤', @bNeedMoveIT108 = 0

		if not exists(select * from MSession where SID = @sid and ExpiredDT > @newDate and MID = 0) begin
			return
		end

		declare @member_acc nvarchar(512) = @uid + '@' + @site,
				@bDel bit, @prev_mid int, @prev_classid int

		select @mid = mid, @bDel = O.bDel
		from Member M, Object O
		where Account = @member_acc and m.MID = o.OID

		-- 預先匯入的會員
		select @prev_mid = mid, @prev_classid = m.ClassID
		from Member M, Object O
		where m.MID = o.OID and bPrev = 1 and EDes = @site and m.EMail = @email
		
		if(@mid is not null and @bDel = 1)
			return

		begin transaction　xp_signIn_sso

			-- 預先匯入的會員登入處理
			if (@prev_mid is not null) begin
				set @mid = @prev_mid

				update Object set CName = @name, EName = @account, CDes = @pic, bDel = 0 where OID = @mid

				update Member 
				set Account = @member_acc, bPrev = 0, LoginCount = LoginCount + 1, LastLoginDT = getdate()
				where MID = @mid

				update Class 
				set CDes= @name, EName = @account 
				where CID = @prev_classid

				exec xp_renameClass @prev_classid, @member_acc
			end
			else if(@mid is null) begin
				insert into Object(CName, CDes, EName, EDes, Type)
					values(@name, @pic, @account, @site, 2)

				set @mid = scope_identity()

				insert into Member(MID, Account, EMail, LoginCount, LastLoginDT)
					values(@mid, @member_acc, @email, 1, getdate())

				declare @gid int = (select gid from Groups where GName = 'Users')

				insert into GM(GID, MID, Role, Type, Status) 
					values(@gid, @mid, 2, null, 1)

				insert into MG(GID, MID, Role, Type, Status) 
					values(@gid, @mid, 2, null, 1)

				declare @cid int = (select CID from Class where CName = '會員' and nLevel = 1 and type = 2),
						@membercid int

				exec xp_insertClass @cid, 2, @member_acc, @name, @account, null, @mid, @membercid output
				
				insert into Permission(CID, PermissionBits, RoleID, RoleType)
					values(@membercid, 63, @mid, 1)

				update Member set ClassID = @membercid where MID = @mid

				declare @eid_learn int = (select EID from Entity where CName = '學習紀錄'),
						@eid_vList int = (select EID from Entity where CName = '影片收藏清單'),
						@eid_pList int = (select EID from Entity where CName = '隨選播放清單'),
						@eid_notebook int = (select eid from Entity where CName = '筆記本'),
						@eid_watch int = (select eid from Entity where CName = '觀看紀錄')

				declare @listcid int, @notecid int, @playcid int, @learncid int, @newlistcid int
				exec xp_insertClass @membercid, @eid_notebook, '筆記本', null, 'Note', null, @mid, @notecid output
				exec xp_insertClass @membercid, 34, '新影片收藏清單', null, null, null, @mid, @newlistcid output
				exec xp_insertClass @membercid, @eid_pList, '隨選播放清單', null, null, null, @mid, @playcid output
				exec xp_insertClass @membercid, @eid_watch, '觀看紀錄', null, null, null, @mid, 0
				exec xp_insertClass @membercid, @eid_learn, '學習紀錄', null, null, null, @mid, @learncid output
				exec xp_insertClass @membercid, 32, '解題紀錄', null, null, null, @mid, 0

				update Class set bHided = 1
				where CID in (@listcid, @playcid, @notecid, @learncid, @newlistcid) 

				declare @coursecid int
				exec xp_insertClass @membercid, 2, '課程', null, null, null, @mid, @coursecid output

				exec xp_insertClass @coursecid, 2, '我的課程', null, null, null, @mid, 0 
				exec xp_insertClass @coursecid, 2, '加入課程', null, null, null, @mid, 0 

				declare @goodcid int
				exec xp_insertClass @membercid, 22, '案讚紀錄', null, null, null, @mid, @goodcid output

				exec xp_insertClass @goodcid, @eid_notebook, '筆記本', null, null, null, @mid, 0
				exec xp_insertClass @goodcid, 18, '影片', null, null, null, @mid, 0
				exec xp_insertClass @goodcid, 23, '留言', null, null, null, @mid, 0

				/*
				exec xp_insertClass @learncid, 18, '影片觀看', null, null, '/history', @mid, 0
				exec xp_insertClass @learncid, 5, '筆記', null, null, '/history', @mid, 0
				exec xp_insertClass @learncid, 16, '影片按讚', null, null, '/history', @mid, 0
				exec xp_insertClass @learncid, 17, '筆記按讚', null, null, '/history', @mid, 0
				exec xp_insertClass @learncid, 14, '影片收藏清單', null, null, '/history', @mid, 0
				exec xp_insertClass @learncid, 15, '隨選播放清單', null, null, '/history', @mid, 0
				*/

			end
			else begin
				declare @classid int = (select ClassID from Member where MID = @mid)
				declare @o_name nvarchar(max) = (select cname from Object where OID = @mid)
			
				update Member 
				set LoginCount = LoginCount + 1, LastLoginDT = getdate(), EMail = @email 
				where MID = @mid

				update Object set CName = @name, EName = @account, CDes = @pic where OID = @mid
				update Class set CDes = @name, EName = @account where CID = @classid


			end

			update MSession set MID = @mid where SID = @SID

			/*
			declare @IT108MID int
			if(@site = 'wkesso') begin
				set @IT108MID = (select top 1 oid from IT108.EDU_Technology.dbo.vd_Member where EDes = 'WKE SSO' and Email = @email)
			end
			else if(@site = 'google') begin
				set @IT108MID = (select top 1 oid from  IT108.EDU_Technology.dbo.vd_Member where EDes = 'Google' and Email = @email)
			end

			if(@IT108MID is not null and exists(select * from Object where nOutlinks is null and OID = @mid))begin
				set @bNeedMoveIT108 = 1 
			end
			*/

			set @status = 1
			set @message = '登入成功'
		commit transaction	xp_signIn_sso
		--登入新增新的一筆MSession
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction xp_signIn_sso
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