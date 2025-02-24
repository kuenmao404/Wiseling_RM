
CREATE view vd_LogManTx as
with tmp as(
	select L.LID, L.AID, L.PID, PS.PostString, M.MID, V.Name, V.Account, M.SID, M.IP, L.VisitDate, L.DataOperation, L.Method
	from LogManTx L, PS, MSession M, vs_Member V
	where L.SID = M.SID and L.PID = PS.PID and M.MID = V.MID
)
select T.LID, A.AID, A.CName, A.EName, T.PID, T.PostString, T.MID, T.Name, T.Account, T.SID, T.IP, T.VisitDate, T.DataOperation, T.Method
from tmp T
left join Action A
on T.AID = A.AID
GO
EXECUTE sp_addextendedproperty @name = N'DS_vd_LogManTx_Method', @value = N'執行的API Method', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'vd_LogManTx', @level2type = N'COLUMN', @level2name = N'Method';


GO
EXECUTE sp_addextendedproperty @name = N'DS_vd_LogManTx_DataOperation', @value = N'insert/delete/update = NULL/0/1', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'vd_LogManTx', @level2type = N'COLUMN', @level2name = N'DataOperation';


GO
EXECUTE sp_addextendedproperty @name = N'DS_vd_LogManTx_VisitDate', @value = N'瀏覽時間，預設值為建立時間', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'vd_LogManTx', @level2type = N'COLUMN', @level2name = N'VisitDate';


GO
EXECUTE sp_addextendedproperty @name = N'DS_vd_LogManTx_IP', @value = N'IP位置', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'vd_LogManTx', @level2type = N'COLUMN', @level2name = N'IP';


GO
EXECUTE sp_addextendedproperty @name = N'DS_vd_LogManTx_SID', @value = N'MSession.SID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'vd_LogManTx', @level2type = N'COLUMN', @level2name = N'SID';


GO
EXECUTE sp_addextendedproperty @name = N'DS_vd_LogManTx_Account', @value = N'執行會員帳號', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'vd_LogManTx', @level2type = N'COLUMN', @level2name = N'Account';


GO
EXECUTE sp_addextendedproperty @name = N'DS_vd_LogManTx_Name', @value = N'執行會員名稱', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'vd_LogManTx', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DS_vd_LogManTx_MID', @value = N'執行會員ID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'vd_LogManTx', @level2type = N'COLUMN', @level2name = N'MID';


GO
EXECUTE sp_addextendedproperty @name = N'DS_vd_LogManTx_PostString', @value = N'記錄網頁Post的內容', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'vd_LogManTx', @level2type = N'COLUMN', @level2name = N'PostString';


GO
EXECUTE sp_addextendedproperty @name = N'DS_vd_LogManTx_EName', @value = N'Action.EName 錯誤sp', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'vd_LogManTx', @level2type = N'COLUMN', @level2name = N'EName';


GO
EXECUTE sp_addextendedproperty @name = N'DS_vd_LogManTx_CName', @value = N'Action.CName 錯誤動作名稱', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'vd_LogManTx', @level2type = N'COLUMN', @level2name = N'CName';


GO
EXECUTE sp_addextendedproperty @name = N'DS_vd_LogManTx_AID', @value = N'Action.AID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'vd_LogManTx', @level2type = N'COLUMN', @level2name = N'AID';

