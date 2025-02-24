create view vd_MemberGroup as
select V.MID, V.Name, V.Account, V.SSO, V.EMail, MG.Role, G.GID, G.GName, G.GDes, G.ID
from vs_Member v, MG, Groups G
where v.MID = MG.MID and MG.GID = G.GID and MG.Status = 1 and G.bDel = 0