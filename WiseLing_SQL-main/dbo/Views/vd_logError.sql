CREATE	view vd_LogError as
with tmp as(
	select L.AID, L.ErrCode, L.ErrMsg, L.ThrowDate, M.SID, O.OID 'MID', O.CName 'Name'
	from LogError L, MSession M, Object O
	where L.SID = M.SID and M.MID = O.OID
)
select A.AID, A.CName, A.EName, T.ErrCode, T.ErrMsg, T.ThrowDate, T.SID, T.MID, T.Name
from tmp T
left join Action A
on T.AID = A.AID
GO
EXECUTE sp_addextendedproperty @name = N'DS_vd_LogError_ThrowDate', @value = N'發生錯誤時間', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'vd_LogError', @level2type = N'COLUMN', @level2name = N'ThrowDate';


GO
EXECUTE sp_addextendedproperty @name = N'DS_vd_logError_SID', @value = N'MSession.SID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'vd_LogError', @level2type = N'COLUMN', @level2name = N'SID';


GO
EXECUTE sp_addextendedproperty @name = N'DS_vd_LogError_Name', @value = N'錯誤人員名稱', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'vd_LogError', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DS_vd_LogError_ErrMsg', @value = N'錯誤訊息', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'vd_LogError', @level2type = N'COLUMN', @level2name = N'ErrMsg';


GO
EXECUTE sp_addextendedproperty @name = N'DS_vd_LogError_ErrCode', @value = N'錯誤代碼', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'vd_LogError', @level2type = N'COLUMN', @level2name = N'ErrCode';


GO
EXECUTE sp_addextendedproperty @name = N'DS_vd_LogError_EName', @value = N'Action.EName 錯誤sp', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'vd_LogError', @level2type = N'COLUMN', @level2name = N'EName';


GO
EXECUTE sp_addextendedproperty @name = N'DS_vd_LogError_CName', @value = N'Action.CName 錯誤動作名稱', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'vd_LogError', @level2type = N'COLUMN', @level2name = N'CName';


GO
EXECUTE sp_addextendedproperty @name = N'DS_vd_LogError_AID', @value = N'Action.AID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'vd_LogError', @level2type = N'COLUMN', @level2name = N'AID';


GO
EXECUTE sp_addextendedproperty @name = N'DS_vd_LogError_MID', @value = N'錯誤人員ID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'vd_LogError', @level2type = N'COLUMN', @level2name = N'MID';


GO
EXECUTE sp_addextendedproperty @name = N'DS_SL_vd_LogError_AID', @value = N'0', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'vd_LogError', @level2type = N'COLUMN', @level2name = N'AID';

