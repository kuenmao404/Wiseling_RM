CREATE TABLE [dbo].[CO] (
    [CID]   INT            NOT NULL,
    [OID]   INT            NOT NULL,
    [Rank]  INT            NULL,
    [MG]    INT            NULL,
    [Des]   NVARCHAR (900) NULL,
    [Since] DATETIME       CONSTRAINT [DF__CO__Since__7EF6D905] DEFAULT (getdate()) NULL,
    CONSTRAINT [PK_CO] PRIMARY KEY CLUSTERED ([CID] ASC, [OID] ASC),
    CONSTRAINT [FK_CO_CID] FOREIGN KEY ([CID]) REFERENCES [dbo].[Class] ([CID]),
    CONSTRAINT [FK_CO_OID] FOREIGN KEY ([OID]) REFERENCES [dbo].[Object] ([OID])
);





