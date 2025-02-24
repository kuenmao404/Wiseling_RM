
create view vd_MGGroup as
select MG.MID, MG.Role, MG.Status, MG.Type, G.GID, G.GName, G.GDes, G.ID
from MG, Groups G
where MG.GID = G.GID and MG.Status = 1