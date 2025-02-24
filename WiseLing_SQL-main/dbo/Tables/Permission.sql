CREATE TABLE [dbo].[Permission] (
    [CID]            INT     NOT NULL,
    [RoleType]       BIT     NOT NULL,
    [RoleID]         INT     NOT NULL,
    [PermissionBits] TINYINT DEFAULT ((1)) NOT NULL,
    CONSTRAINT [FK_Permission_CID] FOREIGN KEY ([CID]) REFERENCES [dbo].[Class] ([CID]),
    CONSTRAINT [UQ_Permission] UNIQUE NONCLUSTERED ([CID] ASC, [RoleType] ASC, [RoleID] ASC)
);




GO
EXECUTE sp_addextendedproperty @name = N'DS_Permission_RoleType', @value = N'0表示是群組，1表示是使用者', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Permission', @level2type = N'COLUMN', @level2name = N'RoleType';


GO
EXECUTE sp_addextendedproperty @name = N'DS_Permission_RoleID', @value = N'由RoleType決定值為Groups.GID或Member.MID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Permission', @level2type = N'COLUMN', @level2name = N'RoleID';

