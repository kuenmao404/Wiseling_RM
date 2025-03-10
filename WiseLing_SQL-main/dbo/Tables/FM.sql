﻿CREATE TABLE [dbo].[FM] (
    [FID]   INT      NOT NULL,
    [MID]   INT      NOT NULL,
    [Since] DATETIME DEFAULT (getdate()) NULL,
    CONSTRAINT [PK_FM] PRIMARY KEY CLUSTERED ([FID] ASC, [MID] ASC),
    CONSTRAINT [FK_FM_FID] FOREIGN KEY ([FID]) REFERENCES [dbo].[Forum] ([FID]),
    CONSTRAINT [FK_FM_MID] FOREIGN KEY ([MID]) REFERENCES [dbo].[Member] ([MID])
);

