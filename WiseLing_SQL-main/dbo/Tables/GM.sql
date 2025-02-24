CREATE TABLE [dbo].[GM] (
    [GID]    INT     NOT NULL,
    [MID]    INT     NOT NULL,
    [Role]   TINYINT DEFAULT ((2)) NOT NULL,
    [Type]   BIT     NULL,
    [Status] BIT     NULL,
    CONSTRAINT [PK_GM] PRIMARY KEY CLUSTERED ([GID] ASC, [MID] ASC),
    CHECK ([Role]>=(0) AND [Role]<=(2)),
    CONSTRAINT [FK_GM_GID] FOREIGN KEY ([GID]) REFERENCES [dbo].[Groups] ([GID]),
    CONSTRAINT [FK_GM_MID] FOREIGN KEY ([MID]) REFERENCES [dbo].[Member] ([MID])
);




GO
EXECUTE sp_addextendedproperty @name = N'DS_GM_Type', @value = N'該關係的類型，null (直接加入)、0 (邀請) 、1 (申請) ', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'GM', @level2type = N'COLUMN', @level2name = N'Type';


GO
EXECUTE sp_addextendedproperty @name = N'DS_GM_Status', @value = N'該關係的狀態，0為申請中、1為正常、null為過期使用者', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'GM', @level2type = N'COLUMN', @level2name = N'Status';


GO
EXECUTE sp_addextendedproperty @name = N'DS_GM_Role', @value = N'使用者在群組中的角色，目前有0是Owner，1是Manager，2是成員', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'GM', @level2type = N'COLUMN', @level2name = N'Role';

