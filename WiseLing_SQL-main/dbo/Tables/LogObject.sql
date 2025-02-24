CREATE TABLE [dbo].[LogObject] (
    [SID]        INT      NOT NULL,
    [OID]        INT      NOT NULL,
    [Operation]  BIT      NOT NULL,
    [IndexCount] INT      NULL,
    [VisitDate]  DATETIME DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_LogObject] PRIMARY KEY CLUSTERED ([SID] ASC, [VisitDate] ASC)
);

