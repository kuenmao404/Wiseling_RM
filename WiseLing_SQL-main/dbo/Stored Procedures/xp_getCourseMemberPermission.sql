CREATE   procedure [dbo].[xp_getCourseMemberPermission]
	@cid int, 
	@mid int
as
begin
	-- 0：申請中；1：已加入；2：未申請
	declare @myJoinStatus int = 2

	if exists(
		select * 
		from vd_Course v, vd_ClassPermissionGroup p, GM
		where v.cid = @cid and v.cid = p.CID 
			and p.RoleType = 0 and p.GDes in ('CourseManager', 'CourseTA', 'CourseMember') 
			and p.GID = gm.GID and gm.Status = 1 and gm.MID = @mid
	) begin
		set @myJoinStatus = 1
	end
	else if exists(
		select * from ApplyHistoryCourse 
		where CourseCID = @cid and ApplyStatus = 0 and ApplyMID = @mid and bDel = 0
	) begin
		set @myJoinStatus = 0
	end

	;with tmp as(
		select s.CID, s.courseName, G.GID, GName, GDes, M.MID, M.Name, M.Account
		from vd_Course s, Permission P, Groups G, vs_Member M
		where s.cid = p.CID and p.RoleID = g.GID and p.RoleType = 0 
		and G.GDes in ('CourseManager', 'CourseTA', 'CourseMember') and g.bDel = 0
		and s.cid = @cid and m.MID = @mid
	)

	select mid, name, cid, courseName, 
		cast([CourseManager] as bit) 'isCourseManager', 
		cast([CourseTA] as bit) 'isCourseTA', 
		cast([CourseMember] as bit) 'isCourseMember',
		@myJoinStatus 'myJoinStatus'
	from (
			select v.MID, v.Name, v.GDes, v.CID, v.courseName, v.Account, iif(MG.MID is null, 0, 1) 'bGroup'
			from tmp v
			left join MG
			on V.MID = MG.MID and MG.GID = V.GID and MG.Status = 1
	) t 
	PIVOT (
		-- 設定彙總欄位及方式
		MAX(bGroup)
		-- 設定轉置欄位，並指定轉置欄位中需彙總的條件值作為新欄位
		for GDes IN ([CourseManager], [CourseTA], [CourseMember])
	) p;

end