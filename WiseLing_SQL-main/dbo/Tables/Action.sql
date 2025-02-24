CREATE TABLE [dbo].[Action] (
    [AID]   INT            IDENTITY (1, 1) NOT NULL,
    [CName] NVARCHAR (255) NULL,
    [EName] NVARCHAR (255) NULL,
    CONSTRAINT [PK_Action] PRIMARY KEY CLUSTERED ([AID] ASC),
    CONSTRAINT [UQ_Action_EName] UNIQUE NONCLUSTERED ([EName] ASC)
);




GO
EXECUTE sp_addextendedproperty @name = N'DS_Action_', @value = N'強化Log資訊', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Action';


GO
EXECUTE sp_addextendedproperty @name = N'DS_Action_EName', @value = N'Stored Procedure名稱', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Action', @level2type = N'COLUMN', @level2name = N'EName';


GO
EXECUTE sp_addextendedproperty @name = N'DS_Action_CName', @value = N'動作名稱', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Action', @level2type = N'COLUMN', @level2name = N'CName';

