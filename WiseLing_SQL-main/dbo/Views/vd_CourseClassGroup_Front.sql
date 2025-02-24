create view vd_CourseClassGroup_Front as
select PCID 'courseCID', PName 'courseName', cid, CName 'gname', EName 'gename', gid 
from vd_CourseClassGroup