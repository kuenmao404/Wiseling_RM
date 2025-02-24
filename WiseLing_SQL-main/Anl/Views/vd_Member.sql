create view Anl.vd_Member as
select mid, name, img, sso, ssoid, email, lastLoginDT, loginCount, since 
from vs_Member
where MID != 0 and bDel = 0 and bHided = 0