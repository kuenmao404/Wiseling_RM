CREATE TABLE [dbo].[UserAgent] (
    [UAID]     INT            IDENTITY (1, 1) NOT NULL,
    [UAString] NVARCHAR (900) NOT NULL,
    [Since]    DATETIME       DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_UserAgent] PRIMARY KEY CLUSTERED ([UAID] ASC),
    UNIQUE NONCLUSTERED ([UAString] ASC)
);

