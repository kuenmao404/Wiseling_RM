CREATE view vd_RootTag as
select CID, Type, CName, EName, IDPath, NamePath, nLevel
from Class
where CID = 750 and Type = 21