CREATE TABLE [dbo].[Tx] (
    [UID]            INT            NOT NULL,
    [MethodType]     INT            NOT NULL,
    [Name]           NVARCHAR (255) NOT NULL,
    [TxType]         BIT            NULL,
    [PermissionType] NVARCHAR (50)  NULL,
    [CheckObject]    BIT            NULL,
    [RequiredCID]    BIT            NULL,
    CONSTRAINT [PK_Tx] PRIMARY KEY CLUSTERED ([UID] ASC, [MethodType] ASC),
    CONSTRAINT [FK_Tx_UID] FOREIGN KEY ([UID]) REFERENCES [dbo].[UUID2Tx] ([UID])
);






GO
EXECUTE sp_addextendedproperty @name = N'DS_Tx_UID', @value = N'UUID2Tx.UID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Tx', @level2type = N'COLUMN', @level2name = N'UID';


GO
EXECUTE sp_addextendedproperty @name = N'DS_Tx_TxType', @value = N'0|1 → View|SP', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Tx', @level2type = N'COLUMN', @level2name = N'TxType';


GO
EXECUTE sp_addextendedproperty @name = N'DS_Tx_PermissionType', @value = N'null|V|R|I|D|U|M|S → null為MID模式', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Tx', @level2type = N'COLUMN', @level2name = N'PermissionType';


GO
EXECUTE sp_addextendedproperty @name = N'DS_Tx_Name', @value = N'View|Sp Name', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Tx', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DS_Tx_MethodType', @value = N'0|1|2|3 → GET|POST|PUT|DELETE', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Tx', @level2type = N'COLUMN', @level2name = N'MethodType';


GO
EXECUTE sp_addextendedproperty @name = N'DS_Tx_CheckObject', @value = N'null|0|1 → view表無Object|有Object，判斷R權限|有Object且hide需判斷M權限', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Tx', @level2type = N'COLUMN', @level2name = N'CheckObject';

