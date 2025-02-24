CREATE TABLE [dbo].[TestCase] (
    [TCID]     INT            NOT NULL,
    [Input]    NVARCHAR (MAX) NULL,
    [Output]   NVARCHAR (MAX) NULL,
    [In_md5]   NVARCHAR (32)  NULL,
    [Out_md5]  NVARCHAR (32)  NULL,
    [bDel]     BIT            DEFAULT ((0)) NULL,
    [Since]    DATETIME       DEFAULT (getdate()) NULL,
    [OwnerMID] INT            NOT NULL,
    CONSTRAINT [PK_TestCase_TCID] PRIMARY KEY CLUSTERED ([TCID] ASC),
    CONSTRAINT [FK_TestCase_OwnerMID] FOREIGN KEY ([OwnerMID]) REFERENCES [dbo].[Member] ([MID])
);

