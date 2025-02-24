create view Anl.vd_Note as
select nid, vid, contentNTID, content, lastModifiedDT, ownerMID, startTime, endTime from dbo.vd_Note