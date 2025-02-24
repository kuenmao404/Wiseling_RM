CREATE TABLE [dbo].[LogMan] (
    [SID]        INT      NOT NULL,
    [TargetType] BIT      NULL,
    [TargetID]   INT      NULL,
    [Operation]  BIT      NOT NULL,
    [Sort]       TINYINT  NULL,
    [IndexCount] INT      NULL,
    [VisitDate]  DATETIME DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_LogMan] PRIMARY KEY CLUSTERED ([SID] ASC, [VisitDate] ASC)
);




GO
EXECUTE sp_addextendedproperty @name = N'DS_LogMan_', @value = N'', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'LogMan';

