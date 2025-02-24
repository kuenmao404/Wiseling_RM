CREATE TABLE [dbo].[MileStone] (
    [MSID]           INT      IDENTITY (1, 1) NOT NULL,
    [ContentNTID]    INT      NOT NULL,
    [Date]           DATE     NOT NULL,
    [Since]          DATETIME DEFAULT (getdate()) NULL,
    [LastModifiedDT] DATETIME DEFAULT (getdate()) NULL,
    [bDel]           BIT      DEFAULT ((0)) NULL,
    CONSTRAINT [PK_MileStone_MSID] PRIMARY KEY CLUSTERED ([MSID] ASC),
    CONSTRAINT [FK_MileStone_ContentNTID] FOREIGN KEY ([ContentNTID]) REFERENCES [dbo].[NText] ([NTID]),
    CONSTRAINT [UQ_MileStone_Date] UNIQUE NONCLUSTERED ([Date] ASC)
);

