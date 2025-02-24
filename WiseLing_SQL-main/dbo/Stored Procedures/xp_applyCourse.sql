CREATE   procedure [dbo].[xp_applyCourse]
	@cid int,
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
		
		declare @joinStatus int = (select joinStatus from vd_Course_Pub where cid = @cid)

		if(@joinStatus is null) begin
			return
		end

		if exists (
			select * 
			from vd_ClassPermissionGroup v, GM
			where v.CID = @cid and v.GDes in ('CourseManager', 'CourseTA' , 'CourseMember') 
			and v.GID = GM.GID and GM.Status = 1 and GM.MID = @mid
		) 
		begin
			set @message = '已是課程成員'
			return
		end

		if(@joinStatus = 2) begin
			set @message = '該課程不開放加入'
			return
		end

		if exists(
			select * 
			from ApplyHistoryCourse 
			where CourseCID = @cid and ApplyMID = @mid and ApplyStatus = 0 and bDel = 0
		)
		begin
			set @message = '已申請中'
			return
		end

		begin transaction　[xp_applyCourse]
			
			-- 直接加入
			if(@joinStatus = 0) begin
				insert into MG(MID, GID, Role, Status)
					select @mid, GID, 2, 1
					from Groups
					where GDes = 'CourseMember' and ID = @cid

				insert into GM(MID, GID, Role, Status)
					select @mid, GID, 2, 1
					from Groups
					where GDes = 'CourseMember' and ID = @cid
				
				insert into CO(CID, OID)
					select v.CID, @mid
					from vd_CourseClassGroup v
					where PCID in (@cid, 0) and v.EName = 'CourseMember' and v.CName = '課程成員'
					and not exists(select * from CO where co.CID = v.CID and co.OID = @mid)

				insert into OC(CID, OID)
					select CID, @mid
					from vd_CourseClassGroup v
					where PCID in (@cid, 0) and v.EName = 'CourseMember' and v.CName = '課程成員'
					and not exists(select * from OC where OC.CID = v.CID and OC.OID = @mid)

				update Class 
				set nObject = (select count(*) from vd_CourseClassGroupMember where courseCID = @cid)
				where CID = @cid

				
				declare @cid_joinCourse int = (select CID from vd_MemberClassCourseNext where mid = @mid and CName = '加入課程')
				insert into CRel(PCID, CCID)
					values(@cid_joinCourse, @cid)

				select @status = 1, @message = '加入成功'
			end
			-- 申請加入
			else if(@joinStatus = 1) begin
				insert into ApplyHistoryCourse(CourseCID, ApplyMID, ApplyStatus)
					values(@cid, @mid, 0)

				select @status = 1, @message = '申請成功'
			end
			
		commit transaction	[xp_applyCourse]
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction [xp_applyCourse]
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