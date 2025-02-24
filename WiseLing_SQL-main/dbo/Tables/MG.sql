CREATE TABLE [dbo].[MG] (
    [MID]    INT     NOT NULL,
    [GID]    INT     NOT NULL,
    [Role]   TINYINT DEFAULT ((2)) NULL,
    [Type]   BIT     DEFAULT (NULL) NULL,
    [Status] BIT     DEFAULT ((1)) NULL,
    CONSTRAINT [PK_MG] PRIMARY KEY CLUSTERED ([MID] ASC, [GID] ASC),
    CONSTRAINT [FK_MG_GID] FOREIGN KEY ([GID]) REFERENCES [dbo].[Groups] ([GID]),
    CONSTRAINT [FK_MG_MID] FOREIGN KEY ([MID]) REFERENCES [dbo].[Member] ([MID])
);


GO
EXECUTE sp_addextendedproperty @name = N'DS_MG_Status', @value = N'該關係的狀態，0為申請中、1為正常、null為過期使用者', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MG', @level2type = N'COLUMN', @level2name = N'Status';


GO
EXECUTE sp_addextendedproperty @name = N'DS_MG_Type', @value = N'該關係的類型，null (直接加入)、0 (邀請) 、1 (申請)', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MG', @level2type = N'COLUMN', @level2name = N'Type';


GO
EXECUTE sp_addextendedproperty @name = N'DS_MG_Role', @value = N'使用者在群組中的角色，目前有0是Owner，1是Manager，2是成員', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MG', @level2type = N'COLUMN', @level2name = N'Role';

