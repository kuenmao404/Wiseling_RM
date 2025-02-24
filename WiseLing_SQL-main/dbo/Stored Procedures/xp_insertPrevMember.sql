CREATE   procedure [dbo].[xp_insertPrevMember]
	@name nvarchar(255),
	@email nvarchar(255),
	@site nvarchar(255),
	@status bit output,
	@message nvarchar(255) output,
	@mid int output
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try
		declare @newDate datetime = getdate()

		select @status = 0, @message = '該SSO與Email已存在'

		declare @member_acc nvarchar(512) = newid(),
				@account nvarchar(255) = newid(),
				@bDel bit, @classID int

		select @mid = m.MID, @bDel = bDel, @classID = ClassID
		from Member M, Object O
		where m.MID = o.OID and EDes = @site and m.EMail = @email
		
		if(@mid is not null and @bDel = 0)
			return

		begin transaction　
			if(@mid is null) begin
				insert into Object(CName, EName, EDes, Type)
					values(@name, @account, @site, 2)

				set @mid = scope_identity()

				insert into Member(MID, Account, EMail, LoginCount, LastLoginDT, bPrev)
					values(@mid, @member_acc, @email, 1, getdate(), 1)

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

				declare @listcid int, @notecid int, @playcid int, @learncid int
				exec xp_insertClass @membercid, @eid_notebook, '筆記本', null, 'Note', null, @mid, @notecid output
				exec xp_insertClass @membercid, @eid_vList, '影片收藏清單', null, null, null, @mid, @listcid output
				exec xp_insertClass @membercid, @eid_pList, '隨選播放清單', null, null, null, @mid, @playcid output
				exec xp_insertClass @membercid, @eid_watch, '觀看紀錄', null, null, null, @mid, 0
				exec xp_insertClass @membercid, @eid_learn, '學習紀錄', null, null, null, @mid, @learncid output
				exec xp_insertClass @membercid, 31, '解題紀錄', null, null, null, @mid, 0

				update Class set bHided = 1
				where CID in (@listcid, @playcid, @notecid, @learncid) 

				declare @coursecid int
				exec xp_insertClass @membercid, 2, '課程', null, null, null, @mid, @coursecid output

				exec xp_insertClass @coursecid, 2, '我的課程', null, null, null, @mid, 0 
				exec xp_insertClass @coursecid, 2, '加入課程', null, null, null, @mid, 0 

				declare @goodcid int
				exec xp_insertClass @membercid, 22, '案讚紀錄', null, null, null, @mid, @goodcid output

				exec xp_insertClass @goodcid, @eid_notebook, '筆記本', null, null, null, @mid, 0
				exec xp_insertClass @goodcid, 18, '影片', null, null, null, @mid, 0
				exec xp_insertClass @goodcid, 23, '留言', null, null, null, @mid, 0


				exec xp_insertClass @learncid, 18, '影片觀看', null, null, '/history', @mid, 0
				exec xp_insertClass @learncid, 5, '筆記', null, null, '/history', @mid, 0
				exec xp_insertClass @learncid, 16, '影片按讚', null, null, '/history', @mid, 0
				exec xp_insertClass @learncid, 17, '筆記按讚', null, null, '/history', @mid, 0
				exec xp_insertClass @learncid, 14, '影片收藏清單', null, null, '/history', @mid, 0
				exec xp_insertClass @learncid, 15, '隨選播放清單', null, null, '/history', @mid, 0

			end
			-- 
			else if (@bDel = 1) begin

				update Object set CName = @name, bDel = 0 where OID = @mid

				update Member 
				set bPrev = 1
				where MID = @mid

				update Class 
				set CDes= @name
				where CID = @classID

			end
			
			set @status = 1
			set @message = '成功'
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
		RAISERROR( @ErrorMessage, @ErrorSeverity, @ErrorState);--回傳錯誤資訊
	end catch
end