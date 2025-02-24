CREATE TABLE [dbo].[MSession] (
    [SID]              INT              IDENTITY (1, 1) NOT NULL,
    [MID]              INT              DEFAULT ((0)) NOT NULL,
    [IP]               NVARCHAR (100)   NULL,
    [UserAgent]        INT              NULL,
    [Since]            DATETIME         DEFAULT (getdate()) NOT NULL,
    [LastModifiedDT]   DATETIME         DEFAULT (getdate()) NULL,
    [ExpiredDT]        DATETIME         NULL,
    [AccessToken]      UNIQUEIDENTIFIER NULL,
    [RefreshToken]     UNIQUEIDENTIFIER NULL,
    [RefreshExpiredDT] DATETIME         NULL,
    [BufferDT]         DATETIME         NULL,
    [RefreshSID]       INT              NULL,
    CONSTRAINT [PK_MSession] PRIMARY KEY CLUSTERED ([SID] ASC),
    CONSTRAINT [FK_MSession_UA] FOREIGN KEY ([UserAgent]) REFERENCES [dbo].[UserAgent] ([UAID]),
    CONSTRAINT [UQ_MSession_AccessToken] UNIQUE NONCLUSTERED ([AccessToken] ASC),
    CONSTRAINT [UQ_MSession_RefreshToken] UNIQUE NONCLUSTERED ([RefreshToken] ASC)
);












GO
EXECUTE sp_addextendedproperty @name = N'DS_MSession_ExpiredDT', @value = N'AccessToken ExpiredDT', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MSession', @level2type = N'COLUMN', @level2name = N'ExpiredDT';

