CREATE TABLE [dbo].[Report] (
    [RID]     INT             IDENTITY (1, 1) NOT NULL,
    [Type]    SMALLINT        NOT NULL,
    [MID]     INT             NOT NULL,
    [Tittle]  NVARCHAR (255)  NULL,
    [Des]     NVARCHAR (4000) NULL,
    [Path]    NVARCHAR (MAX)  NULL,
    [Since]   DATETIME        DEFAULT (getdate()) NULL,
    [bHandle] BIT             DEFAULT ((0)) NULL,
    [bDel]    BIT             DEFAULT ((0)) NULL,
    CONSTRAINT [PK_Report_RID] PRIMARY KEY CLUSTERED ([RID] ASC),
    CONSTRAINT [FK_Report_MID] FOREIGN KEY ([MID]) REFERENCES [dbo].[Member] ([MID]),
    CONSTRAINT [FK_Report_Type] FOREIGN KEY ([Type]) REFERENCES [dbo].[Entity] ([EID])
);



