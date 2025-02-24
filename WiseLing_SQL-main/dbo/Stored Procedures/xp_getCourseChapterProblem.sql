CREATE   procedure [dbo].[xp_getCourseChapterProblem]
	@courseCID int,
	@cid int,
	@bTotal bit,
	@like nvarchar(255),
	@start int = 1,
	@counts int = 10
as
begin

	if(@courseCID is null)
		return

	if(@start is null or @start < 1 or @counts < 1) begin
		return
	end
	
	set @counts = iif(@counts > 50, 50, @counts)

	declare @SQLString nvarchar(1024), @ParmDefinition nvarchar(255)


	if(@like is null or @like = '') begin
		
		set @SQLString = N'
			;with t as(
				select distinct(p.pid)
				from vd_CourseChapterVideo c, ORel o, vd_Problem p
				where c.courseCID = @courseCID and c.cid = @cid and c.vid = o.OID1 and o.OID2 = p.pid
			)
			select ' +
			iif(@bTotal = 1, N'count(*) as total ',
				N'v.pid, v.title, v.difficulty, 
				(
					select a.cid, a.cname, a.ename, a.keywords 
					from OC, vd_AlgorithmTag a
					where v.pid = oc.OID and oc.CID = a.CID
					order by rank
					for json auto, include_null_values
				) as tag , cast(1 as bit) as bRecommend, cast(iif(c.oid is null, 0, 1) as bit) as bChoose '	
			) +
			N'from vd_Problem v, t
			left join vd_CourseChapterItem c
			on  c.courseCID = @courseCID and c.cid = @cid and c.oid = t.pid 
			where v.pid = t.pid ' +
			iif(@bTotal = 1, '', 
				N'order by bRecommend desc, difficulty
				offset @start - 1 row fetch next @counts rows only'
			)

	end
	else begin
		
		if(@bTotal = 1) begin
			
			set @SQLString = N'
				select count(*) as total 
				from vd_Problem 
				where keywords + title like ''%'' + @like + ''%'' '
		end
		else begin
		
			set @SQLString = N'
				;with t as(
					select distinct(p.pid)
					from vd_CourseChapterVideo c, ORel o, vd_Problem p
					where c.courseCID = @courseCID and c.cid = @cid and c.vid = o.OID1 and o.OID2 = p.pid
				)
				select v.pid, v.title, v.difficulty, 
					(
						select a.cid, a.cname, a.ename, a.keywords 
						from OC, vd_AlgorithmTag a
						where v.pid = oc.OID and oc.CID = a.CID
						order by rank
						for json auto, include_null_values
					) as tag , cast(iif(t.pid is null, 0, 1) as bit) as bRecommend, cast(iif(c.oid is null, 0, 1) as bit) as bChoose
				from vd_Problem v
				left join t
				on v.pid = t.pid
				left join vd_CourseChapterItem c
				on  c.courseCID = @courseCID and c.cid = @cid and c.oid = v.pid
				where isnull(v.keywords, '''') + v.title like ''%'' + @like + ''%''  
				order by bRecommend desc, difficulty
				offset @start - 1 row fetch next @counts rows only'
			
		end

	end



	set @ParmDefinition = N'@courseCID int,
							@cid int,
							@start int,
							@counts int,
							@like nvarchar(255)';  

	execute sp_executesql @SQLString, @ParmDefinition,  
                      @courseCID = @courseCID, @cid = @cid,
					  @start = @start, @counts = @counts, @like = @like
	

end