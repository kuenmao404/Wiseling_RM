CREATE view vd_AliveToken as
select iid, cid, courseName, gcid, gid, gname, email, since, expiredDT, token --, cast(1 as bit) 'status', '讀取Token成功' 'message'
from vd_InviteHistory
where bDel = 0 and getdate() < expiredDT and SendEMailOK = 1 and bActive = 0