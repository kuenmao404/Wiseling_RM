CREATE TABLE [dbo].[Inheritance] (
    [PCID] INT      NOT NULL,
    [CCID] INT      NOT NULL,
    [Rank] SMALLINT NULL,
    [MG]   TINYINT  NULL,
    CONSTRAINT [PK_Inheritance] PRIMARY KEY CLUSTERED ([PCID] ASC, [CCID] ASC),
    CONSTRAINT [FK_Inheritance_CCID] FOREIGN KEY ([CCID]) REFERENCES [dbo].[Class] ([CID]),
    CONSTRAINT [FK_Inheritance_PCID] FOREIGN KEY ([PCID]) REFERENCES [dbo].[Class] ([CID])
);

