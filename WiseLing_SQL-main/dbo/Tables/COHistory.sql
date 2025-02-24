CREATE TABLE [dbo].[COHistory] (
    [CID]      INT  NOT NULL,
    [Since]    DATE DEFAULT (getdate()) NOT NULL,
    [OID]      INT  NOT NULL,
    [ViewTime] INT  NULL,
    [Rank]     INT  NULL,
    CONSTRAINT [PK_COHistory] PRIMARY KEY CLUSTERED ([CID] ASC, [Since] ASC, [OID] ASC),
    CONSTRAINT [FK_COHistory_CID] FOREIGN KEY ([CID]) REFERENCES [dbo].[Class] ([CID]),
    CONSTRAINT [FK_COHistory_OID] FOREIGN KEY ([OID]) REFERENCES [dbo].[Object] ([OID])
);

