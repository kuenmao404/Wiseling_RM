CREATE TABLE [dbo].[Entity] (
    [EID]    SMALLINT      IDENTITY (1, 1) NOT NULL,
    [CName]  NVARCHAR (50) NOT NULL,
    [EName]  NVARCHAR (50) NOT NULL,
    [bORel]  BIT           DEFAULT ((1)) NOT NULL,
    [bHided] BIT           DEFAULT ((0)) NULL,
    [bDel]   BIT           DEFAULT ((0)) NULL,
    CONSTRAINT [PK_Entity] PRIMARY KEY CLUSTERED ([EID] ASC)
);

