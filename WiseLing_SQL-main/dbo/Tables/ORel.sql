CREATE TABLE [dbo].[ORel] (
    [OID1] INT            NOT NULL,
    [OID2] INT            NOT NULL,
    [Rank] INT            NULL,
    [Des]  NVARCHAR (900) NULL,
    CONSTRAINT [PK_ORel] PRIMARY KEY CLUSTERED ([OID1] ASC, [OID2] ASC),
    CONSTRAINT [FK_ORel_OID1] FOREIGN KEY ([OID1]) REFERENCES [dbo].[Object] ([OID]),
    CONSTRAINT [FK_ORel_OID2] FOREIGN KEY ([OID2]) REFERENCES [dbo].[Object] ([OID])
);

