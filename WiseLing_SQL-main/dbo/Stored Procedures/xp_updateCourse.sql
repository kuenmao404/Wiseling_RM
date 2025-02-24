CREATE   procedure [dbo].[xp_updateCourse]
	@cid int, 
	@courseName nvarchar(230),
	@courseDes nvarchar(4000),
	@tags nvarchar(max),
	@courseStatus int,
	@joinStatus int,
	@ownerMID int,
	@oid_archive int,
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

		declare @o_cname nvarchar(max), @o_joinStatus int, @o_courseStatus int, @o_logouuid nvarchar(255)
		
		select @o_cname = courseName, @o_joinStatus = joinStatus, @o_courseStatus = courseStatus,  @o_logouuid = REPLACE(logo, 'UUID=', '')
		from vd_Course where cid = @cid and ownerMID = @ownerMID
		
		if(@o_cname is null) begin
			return
		end

		if(len(@courseName) = 0 or len(@courseDes) = 0) begin
			set @message = '課程名稱或描述不為空'
			return
		end

		set @courseName = replace(@courseName, '/', '<\>')

		if exists(select * from vd_MemberClassCourse where MID = @ownerMID and courseName = @courseName and CID != @cid) begin
			set @message = '創建者的課程>課程名稱重複'
			return
		end

		if(@courseStatus not in (0,1) or @joinStatus not in (0,1,2)) begin
			set @message = '課程或成員加入狀態錯誤'
			return
		end

		-- 狀態為私人則不開放加入學生
		set @joinStatus = iif(@courseStatus = 1, 2, @joinStatus)

		-- 原為私人，更改為公開，加入課程類型設為申請加入
		if(@o_courseStatus != @courseStatus and @courseStatus = 0) begin
			set @joinStatus = 1
		end

		-- tags
		declare @tmp table(sno int, tag_str nvarchar(20) COLLATE Chinese_Taiwan_Stroke_CS_AS)
		declare	@tags_t nvarchar(max) = @tags COLLATE Chinese_Taiwan_Stroke_CS_AS

		insert into @tmp
			select ordinal, value 
			from string_split(@tags, ' ', 1)
			where value != ''

		if exists(select tag_str, count(*) from @tmp group by tag_str having count(*) > 1)
		begin
			set @message = '不可包含重複tag'
			return
		end

		-- 判斷有無更改
		declare @bUpdate bit = 1
		declare @url nvarchar(255) = (select URL from vd_Archive where OID = @oid_archive)

		if(@courseName is null and @courseDes is null and @url is null)begin
			set @bUpdate = 0
		end

		

		begin transaction　[xp_updateCourse]
			if(@url is not null) begin
				update Object set bDel = 0 where OID = @oid_archive and type = 3

				update o
				set bDel = 1
				from Object o, vd_Archive v
				where o.OID = v.OID and v.UUID = @o_logouuid
			end
			
 
			-- 課程名稱更改
			if(@o_cname != @courseName and @courseName is not null) begin
				exec xp_renameClass @cid, @courseName
			end

			update Class 
			set CDes = isnull(@courseDes, CDes), cRank = isnull(@courseStatus, cRank), oRank = isnull(@joinStatus, oRank), 
				LastModifiedDT = iif(@bUpdate = 1, getdate(), LastModifiedDT), EDes = isnull(@url, EDes)				
			where CID = @cid

			
			if(@courseStatus is not null) begin
				declare @cid_chapter int = (select CID from vd_CourseNext where courseCID = @cid and cname = '章節')

				update Permission 
				set PermissionBits = iif(@courseStatus = 0, 1, 0) 
				from Groups g
				where Permission.CID = @cid and Permission.RoleType = 0 and Permission.RoleID = g.GID
				and g.GName in ('Users', 'Guest')

				update Permission 
				set PermissionBits = iif(@courseStatus = 0, 1, 0)  
				from fn_getChildClassWithParent(@cid_chapter) f, Groups g
				where  f.CCID = Permission.CID and Permission.RoleType = 0 and Permission.RoleID = g.GID
				and g.GName in ('Users', 'Guest')
			end
			
			
			-- tag 統一刪除在重建，邏輯簡單
			
			update Tag set UseCount = UseCount - 1
			from CT
			where CT.CID = @cid and CT.TID = Tag.TID

			delete CT where CID = @cid
			delete TC where CID = @cid

			update Tag set UseCount = UseCount + 1
			from @tmp t
			where Tag.Text = t.tag_str
			
			insert into Tag(Text, UseCount)
				select t.tag_str, 1 
				from @tmp t
				where not exists(select * from Tag where Text = t.tag_str)

			insert into CT(CID, TID, Rank)
				select @cid, g.TID, t.sno
				from @tmp t, Tag g
				where t.tag_str = g.Text

			insert into TC(CID, TID)
				select @cid, g.TID
				from @tmp t, Tag g
				where t.tag_str = g.Text

			if(@o_joinStatus = 1 and @joinStatus = 0)begin
				update ApplyHistoryCourse set bDel = 1 where CourseCID = @cid
			end

			select @status = 1, @message = '編輯成功'
		commit transaction	[xp_updateCourse]
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction [xp_updateCourse]
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