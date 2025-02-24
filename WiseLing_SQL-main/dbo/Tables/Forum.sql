CREATE TABLE [dbo].[Forum] (
    [FID]            INT            IDENTITY (1, 1) NOT NULL,
    [Title]          NVARCHAR (200) NULL,
    [TID]            INT            NOT NULL,
    [MID]            INT            NOT NULL,
    [LastModifiedDT] DATETIME       DEFAULT (getdate()) NULL,
    [nlevel]         INT            DEFAULT ((1)) NULL,
    [bUpdate]        BIT            DEFAULT ((0)) NULL,
    [bDel]           BIT            DEFAULT ((0)) NULL,
    [nC]             INT            DEFAULT ((0)) NULL,
    [bBest]          BIT            DEFAULT ((0)) NULL,
    [nLike]          INT            DEFAULT ((0)) NULL,
    [bTop]           BIT            DEFAULT ((0)) NULL,
    [Since]          DATETIME       DEFAULT (getdate()) NULL,
    [Tag]            NVARCHAR (255) NULL,
    [bTitle]         BIT            DEFAULT ((0)) NULL,
    CONSTRAINT [PK_Forum_FID] PRIMARY KEY CLUSTERED ([FID] ASC),
    CONSTRAINT [FK_Forum_MID] FOREIGN KEY ([MID]) REFERENCES [dbo].[Member] ([MID]),
    CONSTRAINT [FK_Forum_TID] FOREIGN KEY ([TID]) REFERENCES [dbo].[Text] ([TID])
);







