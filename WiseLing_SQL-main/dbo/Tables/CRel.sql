CREATE TABLE [dbo].[CRel] (
    [PCID]    INT      NOT NULL,
    [CCID]    INT      NOT NULL,
    [Rank]    SMALLINT NULL,
    [MG]      INT      NULL,
    [bStatus] BIT      NULL,
    CONSTRAINT [PK_CRel] PRIMARY KEY CLUSTERED ([PCID] ASC, [CCID] ASC),
    CONSTRAINT [FK_CRel_CCID] FOREIGN KEY ([CCID]) REFERENCES [dbo].[Class] ([CID]),
    CONSTRAINT [FK_CRel_PCID] FOREIGN KEY ([PCID]) REFERENCES [dbo].[Class] ([CID])
);






GO
EXECUTE sp_addextendedproperty @name = N'DS_CRel_', @value = N'Class本身關聯，不破壞Inheritence', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'CRel';

