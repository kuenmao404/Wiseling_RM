﻿CREATE TABLE [dbo].[Solution] (
    [SID]  INT            IDENTITY (1, 1) NOT NULL,
    [Text] NVARCHAR (MAX) NULL,
    [MD5]  NVARCHAR (32)  NOT NULL,
    CONSTRAINT [PK_Solution_SID] PRIMARY KEY CLUSTERED ([SID] ASC),
    CONSTRAINT [UQ_Solution_MD5] UNIQUE NONCLUSTERED ([MD5] ASC)
);

