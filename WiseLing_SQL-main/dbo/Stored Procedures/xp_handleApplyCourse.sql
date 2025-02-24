CREATE   procedure [dbo].[xp_handleApplyCourse]
	@courseCID int,
	@applyID int,
	@bAccept bit,
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

		declare @applyMID int = (
			select ApplyMID 
			from ApplyHistoryCourse
			where CourseCID = @courseCID and AID = @applyID
			and bDel = 0
		)	

		if (@applyMID is null) begin
			return
		end

		if exists (
			select * 
			from vd_ClassPermissionGroup v, GM
			where v.CID = @courseCID and v.GDes in ('CourseManager', 'CourseTA' , 'CourseMember') 
			and v.GID = GM.GID and GM.Status = 1 and GM.MID = @applyMID
		) 
		begin
			set @message = '已是課程成員'
			return
		end

		if (@bAccept is null) begin
			set @message = '請選擇接受或拒絕'
			return
		end
		

		begin transaction　[xp_handleApplyCourse]
			
			update ApplyHistoryCourse 
			set ApplyStatus = iif(@bAccept = 1, 1, 2), HandelMID = @mid, HandelDate = getdate()
			where AID = @applyID
			
			-- 接受
			if(@bAccept = 1) begin
				insert into MG(MID, GID, Role, Status)
					select @applyMID, GID, 2, 1
					from Groups
					where GDes = 'CourseMember' and ID = @courseCID

				insert into GM(MID, GID, Role, Status)
					select @applyMID, GID, 2, 1
					from Groups
					where GDes = 'CourseMember' and ID = @courseCID
				
				insert into CO(CID, OID)
					select CID, @applyMID
					from vd_CourseClassGroup v
					where PCID in (@courseCID, 0) and v.EName = 'CourseMember' and v.CName = '課程成員'
					and not exists(select * from CO where co.CID = v.CID and co.OID = @applyMID)

				insert into OC(CID, OID)
					select CID, @applyMID
					from vd_CourseClassGroup v
					where PCID in (@courseCID, 0) and v.EName = 'CourseMember' and v.CName = '課程成員'
					and not exists(select * from OC where OC.CID = v.CID and OC.OID = @applyMID)

				update Class 
				set nObject = (select count(*) from vd_CourseClassGroupMember where courseCID = @courseCID)
				where CID = @courseCID

				declare @cid_joinCourse int = (select CID from vd_MemberClassCourseNext where mid = @applyMID and CName = '加入課程')
				
				insert into CRel(PCID, CCID)
					values(@cid_joinCourse, @courseCID)

				select @status = 1, @message = '接受申請成功'
			end
			-- 拒絕
			else if(@bAccept = 0) begin
				
				select @status = 1, @message = '拒絕申請成功'
			end
			
		commit transaction	[xp_handleApplyCourse]
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction [xp_handleApplyCourse]
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