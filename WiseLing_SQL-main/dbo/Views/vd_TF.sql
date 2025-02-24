create view vd_TF as
select TF.TID, TF.FID
from TF, Forum F
where TF.FID = F.FID and f.bDel = 0