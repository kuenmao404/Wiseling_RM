CREATE TABLE [dbo].[Groups] (
    [GID]     INT             IDENTITY (1, 1) NOT NULL,
    [GName]   NVARCHAR (50)   NOT NULL,
    [GDes]    NVARCHAR (1024) NULL,
    [Status]  TINYINT         NULL,
    [Since]   DATETIME        DEFAULT (getdate()) NOT NULL,
    [Type]    TINYINT         NULL,
    [bHided]  BIT             DEFAULT ((0)) NOT NULL,
    [bDel]    BIT             DEFAULT ((0)) NOT NULL,
    [ID]      INT             NULL,
    [ClassID] INT             NULL,
    CONSTRAINT [PK_Groups] PRIMARY KEY CLUSTERED ([GID] ASC) WITH (FILLFACTOR = 80),
    CONSTRAINT [FK_Groups_ClassID] FOREIGN KEY ([ClassID]) REFERENCES [dbo].[Class] ([CID]),
    CONSTRAINT [UQ_Groups] UNIQUE NONCLUSTERED ([GName] ASC) WITH (FILLFACTOR = 80)
);







