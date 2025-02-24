CREATE TABLE [dbo].[Channel] (
    [CID]          INT            IDENTITY (1, 1) NOT NULL,
    [ChannelTitle] NVARCHAR (255) NULL,
    [ChannelID]    NVARCHAR (100) NULL,
    [Des]          NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_Channel_CID] PRIMARY KEY CLUSTERED ([CID] ASC),
    CONSTRAINT [UQ_Channel_ChannelID] UNIQUE NONCLUSTERED ([ChannelID] ASC)
);



