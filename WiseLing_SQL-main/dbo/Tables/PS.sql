﻿CREATE TABLE [dbo].[PS] (
    [PID]        INT            IDENTITY (1, 1) NOT NULL,
    [PostString] NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_PS] PRIMARY KEY CLUSTERED ([PID] ASC)
);

