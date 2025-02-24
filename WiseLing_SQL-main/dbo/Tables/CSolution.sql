CREATE TABLE [dbo].[CSolution] (
    [CID]      INT      NOT NULL,
    [SID]      INT      NOT NULL,
    [Rank]     INT      NOT NULL,
    [PLID]     INT      NOT NULL,
    [OwnerMID] INT      NOT NULL,
    [Since]    DATETIME DEFAULT (getdate()) NULL,
    [bDel]     BIT      DEFAULT ((0)) NULL,
    CONSTRAINT [PK_CSolution] PRIMARY KEY CLUSTERED ([CID] ASC, [SID] ASC, [Rank] ASC),
    CONSTRAINT [FK_CSolution_CID] FOREIGN KEY ([CID]) REFERENCES [dbo].[Class] ([CID]),
    CONSTRAINT [FK_CSolution_OwnerMID] FOREIGN KEY ([OwnerMID]) REFERENCES [dbo].[Member] ([MID]),
    CONSTRAINT [FK_CSolution_PLID] FOREIGN KEY ([PLID]) REFERENCES [dbo].[Object] ([OID]),
    CONSTRAINT [FK_CSolution_SID] FOREIGN KEY ([SID]) REFERENCES [dbo].[Solution] ([SID])
);

