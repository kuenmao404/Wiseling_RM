CREATE   procedure [dbo].[xp_insertCourse]
	@courseName nvarchar(230),
	@courseDes nvarchar(4000),
	@tags nvarchar(512),
	@courseStatus int, -- 0|1 (公開|私人) 
	@joinStatus int,   -- 0|1|2 (直接加入|申請加入|不開放) 
	@oid_archive int,
	@mid int,
	@sid int,
	@cid_course int output,
	@status bit output,
	@message nvarchar(max) output
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	select @status = 0, @message = '錯誤'
	begin try

		declare @cid_mycourse int = (select CID from vd_MemberClassCourseNext where MID = @mid and CName = '我的課程')
		if(@cid_mycourse is null) begin
			return
		end

		set @courseStatus = isnull(@courseStatus, 1)
		-- 狀態為私人則不開放加入學生
		set @joinStatus = iif(@courseStatus = 1, 2, @joinStatus)

		set @courseName = replace(@courseName, '/', '<\>')

		-- tags
		declare @tmp table(sno int, tag_str nvarchar(20) COLLATE Chinese_Taiwan_Stroke_CS_AS)
		declare	@tags_t nvarchar(max) = @tags COLLATE Chinese_Taiwan_Stroke_CS_AS

		insert into @tmp
			select ordinal, value 
			from string_split(@tags, ' ', 1)
			where value != ''

		if(len(@courseName) = 0 or @courseName is null or @courseDes is null or len(@courseDes) = 0) begin
			set @message = '課程或描述名稱不為空'
		end
		else if exists(select * from vd_MemberClassCourse where MID = @mid and courseName = @courseName and ownerMID = @mid) begin
			set @message = '我的課程>課程名稱重複'
		end
		else if(@courseStatus not in (0,1) or @joinStatus not in (0,1,2)) begin
			set @message = '課程或成員加入狀態錯誤'
		end
		else if((select COUNT(*) from vd_MemberClassCourse where mid = @mid and ownerMID = @mid) > 2 
			and 
			not exists(select * from vd_MGGroup where MID = @mid and GName = '教師')
		)
			set @message = '一般會員僅能創建3個課程'
		else if exists(select tag_str, count(*) from @tmp group by tag_str having count(*) > 1)
			set @message = '不可包含重複tag'
		else 
			set @status = 1
	
		if(@status = 0)
			return

		declare @url nvarchar(255) = (select URL from vd_Archive where OID = @oid_archive)

		begin transaction　[xp_insertCourse]

			declare @eid int = (select EID from Entity where CName = '課程')

			-- 課程
			exec xp_insertClass @cid_mycourse, @eid, @courseName, @courseDes, null, @url, @mid, @cid_course output

			update Class set cRank = @courseStatus, oRank = @joinStatus, nObject = 1 where cid = @cid_course

			-- 課程圖片
			update Object set bDel = 0 where OID = @oid_archive and type = 3

			declare @cid_root int = (select cid from vd_RootCourse)

			insert into CRel(PCID, CCID)
				values(@cid_root, @cid_course)
			
			-- 課程群組
			declare @gname_sa nvarchar(max) =  '課程管理員_' + cast(@cid_course as varchar),
					@gname_t nvarchar(max) =  '課程助教_' + cast(@cid_course as varchar),
					@gname_m nvarchar(max) =  '課程成員_' + cast(@cid_course as varchar)

			declare @gid_sa int, @gid_t int, @gid_m int

			insert into Groups (GName, GDes, ID, Type, Status)
				values(@gname_sa, 'CourseManager', @cid_course, 0, 1),
						(@gname_t, 'CourseTA', @cid_course, 0, 1),
						(@gname_m, 'CourseMember', @cid_course, 0, 1)

			select @gid_sa = (select GID from Groups where GName = @gname_sa),
					@gid_t = (select GID from Groups where GName = @gname_t),
					@gid_m = (select GID from Groups where GName = @gname_m)

			insert into Permission(CID, PermissionBits, RoleID, RoleType)
				values(@cid_course, 63, @gid_sa, 0), (@cid_course, 55, @gid_t, 0), (@cid_course, 3, @gid_m, 0)

			--各type
			declare @eid_Group int = (select EID from Entity where CName = '群組'),
					@eid_Chapter int = (select EID from Entity where CName = '章節'),
					@eid_Note int = (select EID from Entity where CName = '課程筆記'),
					@eid_Teach int = (select EID from Entity where CName = '教材'),
					@eid_Learn int = (select EID from Entity where CName = '學習紀錄'),
					@eid_Forum int = (select EID from Entity where CName = '討論區')

			
			--學習紀錄
			declare @cid_learn int
			exec xp_insertClass @cid_course, @eid_Learn, '學習紀錄', null, null, null, @mid, @cid_learn output

			update Permission set PermissionBits = 1 -- 成員只能看
			where CID = @cid_learn and RoleID = @gid_m and RoleType = 0

			exec xp_insertClass @cid_learn, 18, '影片觀看', null, null, null, @mid, 0
			exec xp_insertClass @cid_learn, 5, '筆記', null, null, null, @mid, 0



			-- 課程群組目錄
			declare @cid_group int, @cid_member int
			exec xp_insertClass @cid_course, @eid_Group, '群組', null, 'Group', null, @mid, @cid_group output
			
			update Permission set PermissionBits = 3 -- 助教課程權限
			where CID = @cid_group and RoleID = @gid_t and RoleType = 0

			exec xp_insertClass @cid_group, @eid_Group, '課程管理員', null, 'CourseManager', null, @mid, 0
			exec xp_insertClass @cid_group, @eid_Group, '課程助教', null, 'CourseTA', null, @mid, 0
			exec xp_insertClass @cid_group, @eid_Group, '課程成員', null, 'CourseMember', null, @mid, @cid_member output
			

			-- 助教有權邀請課程成員
			update Permission set PermissionBits = 7
			where CID = @cid_member and RoleType = 0 and RoleID = @gid_m

			-- 更新Groups.ClassID
			update Groups set ClassID = v.CID
			from vd_CourseClassGroup_Classonly v
			where v.PCID = @cid_course and v.EName = Groups.GDes and Groups.GID in (@gid_m, @gid_sa, @gid_t)
			
			-- 創建者新增至管理員 (課程群組目錄創建之後)
			insert into GM(GID, MID, Status, Type, Role)
				values(@gid_sa, @mid, 1, null, 0)

			insert into MG(GID, MID, Status, Type, Role)
				values(@gid_sa, @mid, 1, null, 0)


			insert into CO(CID, OID)
				select v.CID, @mid 
				from vd_CourseClassGroup v
				where PCID = @cid_course and EName = 'CourseManager'
					

			insert into OC(CID, OID)
				select v.CID, @mid 
				from vd_CourseClassGroup v
				where PCID = @cid_course and EName = 'CourseManager'
					
			
			-- 教材目錄
			declare @cid_Teach int, @cid_Forum int

			exec xp_insertClass @cid_course, @eid_Teach, '教材', null, 'Teach', null, @mid, @cid_Teach output

			update Permission set PermissionBits = 63 -- 助教教材權限
			where CID = @cid_Teach and RoleID = @gid_t and RoleType = 0

			-- 討論區目錄
			exec xp_insertClass @cid_course, @eid_Forum, '討論區', null, 'Forum', null, @mid, @cid_Forum output

			update Permission set PermissionBits = 47 -- 助教權限
			where CID = @cid_Forum and RoleID in (@gid_t, @gid_sa) and RoleType = 0

			update Permission set PermissionBits = 7 -- 課程成員權限
			where CID = @cid_Forum and RoleID = @gid_m and RoleType = 0

			-- 解題記錄
			declare @judgeCID int
			exec xp_insertClass @cid_course, 32, '解題紀錄', null, 'JudgeSolve', null, @mid, @judgeCID output

			update Permission set PermissionBits = 63 -- 助教權限
			where CID = @judgeCID and RoleID in (@gid_t, @gid_sa) and RoleType = 0

			update Permission set PermissionBits = 1 -- 課程成員權限
			where CID = @judgeCID and RoleID = @gid_m and RoleType = 0	

			-- 會員與訪客 (此行程式碼順序不能移重要!!)
			insert into Permission(CID, PermissionBits, RoleID, RoleType)
				select @cid_course, iif(@courseStatus = 0, 1, 0), GID, 0 
				from Groups where GName in ('Users', 'Guest')

			-- 章節子目錄
			declare @cid_Chapter int
			exec xp_insertClass @cid_course, @eid_Chapter, '章節', null, 'Chapter', null, @mid, @cid_Chapter output

			update Permission set PermissionBits = 63 -- 助教章節權限
			where CID = @cid_Chapter and RoleID = @gid_t and RoleType = 0

			
			-- tag
			update Tag set UseCount = UseCount + 1
			from @tmp t
			where Tag.Text = t.tag_str
			
			insert into Tag(Text, UseCount)
				select t.tag_str, 1 
				from @tmp t
				where not exists(select * from Tag where Text = t.tag_str)

			insert into CT(CID, TID, Rank)
				select @cid_course, g.TID, t.sno
				from @tmp t, Tag g
				where t.tag_str = g.Text

			insert into TC(CID, TID)
				select @cid_course, g.TID
				from @tmp t, Tag g
				where t.tag_str = g.Text

			select @status = 1, @message = '建立成功'
		commit transaction	[xp_insertCourse]
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction [xp_insertCourse]
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