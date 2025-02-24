CREATE TABLE [dbo].[ApplyHistoryCourse] (
    [AID]         INT      IDENTITY (1, 1) NOT NULL,
    [CourseCID]   INT      NOT NULL,
    [ApplyMID]    INT      NOT NULL,
    [ApplyStatus] INT      NOT NULL,
    [Since]       DATETIME DEFAULT (getdate()) NULL,
    [HandelMID]   INT      NULL,
    [HandelDate]  DATETIME NULL,
    [bDel]        BIT      DEFAULT ((0)) NULL,
    CONSTRAINT [PK_ApplyHistoryCourse] PRIMARY KEY CLUSTERED ([AID] ASC),
    CONSTRAINT [FK_ApplyHistoryCourse_ApplyMID] FOREIGN KEY ([ApplyMID]) REFERENCES [dbo].[Member] ([MID]),
    CONSTRAINT [FK_ApplyHistoryCourse_CourseCID] FOREIGN KEY ([CourseCID]) REFERENCES [dbo].[Class] ([CID])
);



