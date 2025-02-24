CREATE  function [dbo].[fn_getCalendarHeatMapData](@id int, @type int, @ntid int, @bCourse bit = 0)
	returns nvarchar(max)
	--Type → 18|5|16|17|14|15 
	--(影片|筆記|影片按讚|筆記按讚|影片收藏清單|隨選播放清單)
as
begin
	
	if(@bCourse = 0) begin
		if(@type = 18) begin
			return (select vid, videoID, title, viewCount, channelCID, channelID, channelTitle from vd_Video_Pub where vid = @id for json auto, without_array_wrapper, include_null_values)
		end
		else if(@type = 5) begin
			return (
				select  c.cid, c.cdes as notebookName, n.nid, v.vid, v.title, v.videoID, 
							iif(n.bDel = 1, n.contentNTID, @ntid) as contentNTID, 
							iif(n.bDel = 1, null , nt.Text) 'content', 
							iif(n.bDel = 1, null , len(nt.Text)) 'contentLength',
							n.startTime, n.endTime, n.bDel 
				from Note n, NText nt, vd_Video_Pub v,  NC, Class c
				where n.nid = @id and nt.NTID = iif(n.bDel = 1, n.contentNTID, @ntid) and n.vid = v.vid and n.nid = nc.NID and nc.CID = c.cid
					and c.Type = 19
				for json path, without_array_wrapper, include_null_values
			)
		end
		else if(@type = 34) begin
			return (select cid, vListName, vListDes, nO, hide, ownerMID, namepath, idpath, dbo.fn_getClassPCID(cid) as pcid from vd_VListNew where cid = @id for json auto, without_array_wrapper, include_null_values)
		end
		else if(@type = 15) begin
			return (select cid, vListName, vListDes, nO, hide, ownerMID from vd_PList where cid = @id for json auto, without_array_wrapper, include_null_values)
		end
	end
	else begin
		if(@type = 18) begin
			return (select vid, videoID, title, viewCount, channelCID, channelID, channelTitle from vd_Video_Pub where vid = @id for json auto, without_array_wrapper, include_null_values)
		end
		else if(@type = 5) begin
			return (
				select  c.cid, c.cdes as notebookName, n.nid, v.vid, v.title, v.videoID, 
							iif(n.bDel = 1, null , len(nt.Text)) 'contentLength', 
							n.bDel 
				from Note n, NText nt, vd_Video_Pub v,  NC, Class c
				where n.nid = @id and nt.NTID = @ntid and n.vid = v.vid and n.nid = nc.NID and nc.CID = c.cid
					and c.Type = 19
				for json path, without_array_wrapper, include_null_values
			)
		end
	end
	

	return null
end