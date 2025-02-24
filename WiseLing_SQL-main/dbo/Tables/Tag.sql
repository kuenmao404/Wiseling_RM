CREATE TABLE [dbo].[Tag] (
    [TID]        INT           IDENTITY (1, 1) NOT NULL,
    [Text]       NVARCHAR (32) COLLATE Chinese_Taiwan_Stroke_CS_AS NOT NULL,
    [UseCount]   INT           DEFAULT ((0)) NULL,
    [SearchText] NVARCHAR (20) NULL,
    [nF]         INT           DEFAULT ((0)) NULL,
    CONSTRAINT [PK_Tag_TID] PRIMARY KEY CLUSTERED ([TID] ASC),
    CONSTRAINT [UQ_Tag_Text] UNIQUE NONCLUSTERED ([Text] ASC)
);







