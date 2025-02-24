CREATE TABLE [dbo].[MSession_log] (
    [ID]               INT              IDENTITY (1, 1) NOT NULL,
    [MID]              INT              DEFAULT ((0)) NOT NULL,
    [Since]            DATETIME         DEFAULT (getdate()) NOT NULL,
    [AccessToken]      UNIQUEIDENTIFIER NULL,
    [RefreshToken]     UNIQUEIDENTIFIER NULL,
    [BufferDT]         DATETIME         NULL,
    [BufferDT_Set]     DATETIME         NULL,
    [AccessToken_Out]  UNIQUEIDENTIFIER NULL,
    [RefreshToken_Out] UNIQUEIDENTIFIER NULL,
    [message]          NVARCHAR (MAX)   NULL,
    CONSTRAINT [PK_MSession_log] PRIMARY KEY CLUSTERED ([ID] ASC)
);

