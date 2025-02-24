CREATE TABLE [dbo].[Video] (
    [VID]         INT            NOT NULL,
    [VideoID]     NVARCHAR (100) NOT NULL,
    [ViewCount]   INT            DEFAULT ((0)) NULL,
    [LikeCount]   INT            DEFAULT ((0)) NULL,
    [unLikeCount] INT            DEFAULT ((0)) NULL,
    [ChannelCID]  INT            NOT NULL,
    [DesLong]     NVARCHAR (MAX) NULL,
    [Duration]    FLOAT (53)     NULL,
    [CategoryId]  NVARCHAR (10)  NULL,
    CONSTRAINT [PK_Video_VID] PRIMARY KEY CLUSTERED ([VID] ASC),
    CONSTRAINT [FK_Video_ChannelCID] FOREIGN KEY ([ChannelCID]) REFERENCES [dbo].[Channel] ([CID]),
    CONSTRAINT [FK_Video_VID] FOREIGN KEY ([VID]) REFERENCES [dbo].[Object] ([OID]),
    CONSTRAINT [UQ_Video_VideoID] UNIQUE NONCLUSTERED ([VideoID] ASC)
);










GO
EXECUTE sp_addextendedproperty @name = N'MS_SL', @value = 0, @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Video', @level2type = N'COLUMN', @level2name = N'VideoID';

