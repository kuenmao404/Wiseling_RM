CREATE TABLE [dbo].[LogError] (
    [SID]       INT            NOT NULL,
    [ErrCode]   INT            NULL,
    [ErrMsg]    NVARCHAR (900) NULL,
    [ThrowDate] DATETIME       DEFAULT (getdate()) NOT NULL,
    [Status]    BIT            DEFAULT ((0)) NULL,
    [AID]       INT            NULL
);








GO
EXECUTE sp_addextendedproperty @name = N'DS_LogError_', @value = N'記錄錯誤資訊', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'LogError';


GO
EXECUTE sp_addextendedproperty @name = N'DS_LogError_ThrowDate', @value = N'錯誤時間', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'LogError', @level2type = N'COLUMN', @level2name = N'ThrowDate';


GO
EXECUTE sp_addextendedproperty @name = N'DS_LogError_SID', @value = N'MSession.SID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'LogError', @level2type = N'COLUMN', @level2name = N'SID';


GO
EXECUTE sp_addextendedproperty @name = N'DS_LogError_ErrMsg', @value = N'錯誤訊息', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'LogError', @level2type = N'COLUMN', @level2name = N'ErrMsg';


GO
EXECUTE sp_addextendedproperty @name = N'DS_LogError_ErrCode', @value = N'錯誤碼', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'LogError', @level2type = N'COLUMN', @level2name = N'ErrCode';


GO
EXECUTE sp_addextendedproperty @name = N'DS_LogError_AID', @value = N'Action.AID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'LogError', @level2type = N'COLUMN', @level2name = N'AID';


GO
EXECUTE sp_addextendedproperty @name = N'DS_LogError_Status', @value = N'預設0，null|0|1，代表：未知|普通錯誤|惡意導致', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'LogError', @level2type = N'COLUMN', @level2name = N'Status';

