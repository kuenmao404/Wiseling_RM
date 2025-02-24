CREATE TABLE [dbo].[StatusCode] (
    [Status] INT            NOT NULL,
    [Msg]    NVARCHAR (64)  NULL,
    [CDes]   NVARCHAR (800) NULL,
    CONSTRAINT [PK_Status] PRIMARY KEY CLUSTERED ([Status] ASC)
);

