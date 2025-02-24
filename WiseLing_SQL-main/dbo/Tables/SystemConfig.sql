CREATE TABLE [dbo].[SystemConfig] (
    [Name]           NVARCHAR (256)  NOT NULL,
    [Des]            NVARCHAR (4000) NULL,
    [Since]          DATETIME        DEFAULT (getdate()) NULL,
    [LastModifiedDT] DATETIME        DEFAULT (getdate()) NULL,
    [bDel]           BIT             DEFAULT ((0)) NULL,
    CONSTRAINT [PK_SystemConfig] PRIMARY KEY CLUSTERED ([Name] ASC)
);

