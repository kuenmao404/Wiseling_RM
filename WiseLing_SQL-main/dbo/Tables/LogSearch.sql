CREATE TABLE [dbo].[LogSearch] (
    [SID]         INT            NOT NULL,
    [QueryString] NVARCHAR (512) NOT NULL,
    [SearchDate]  DATETIME       DEFAULT (getdate()) NOT NULL
);

