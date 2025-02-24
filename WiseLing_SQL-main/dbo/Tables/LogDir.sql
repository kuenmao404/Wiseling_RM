CREATE TABLE [dbo].[LogDir] (
    [SID]       INT      NOT NULL,
    [CID]       INT      NOT NULL,
    [Operation] BIT      NOT NULL,
    [Sort]      TINYINT  NULL,
    [VisitDate] DATETIME DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_LogDir] PRIMARY KEY CLUSTERED ([SID] ASC, [VisitDate] ASC)
);

