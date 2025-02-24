CREATE TABLE [dbo].[OC] (
    [OID]   INT            NOT NULL,
    [CID]   INT            NOT NULL,
    [Rank]  INT            NULL,
    [MG]    INT            NULL,
    [Des]   NVARCHAR (900) NULL,
    [Since] DATETIME       CONSTRAINT [DF__OC__Since__1209AD79] DEFAULT (getdate()) NULL,
    CONSTRAINT [PK_OC] PRIMARY KEY CLUSTERED ([OID] ASC, [CID] ASC),
    CONSTRAINT [FK_OC_CID] FOREIGN KEY ([CID]) REFERENCES [dbo].[Class] ([CID]),
    CONSTRAINT [FK_OC_OID] FOREIGN KEY ([OID]) REFERENCES [dbo].[Object] ([OID])
);







