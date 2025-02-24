CREATE TABLE [dbo].[Nation] (
    [NID]         SMALLINT      IDENTITY (1, 1) NOT NULL,
    [CName]       NVARCHAR (50) NOT NULL,
    [EName]       VARCHAR (50)  NOT NULL,
    [CountryCode] VARCHAR (25)  NULL,
    [ISOCode2]    VARCHAR (2)   NOT NULL,
    [ISOCode3]    VARCHAR (3)   NOT NULL,
    CONSTRAINT [PK_Nation] PRIMARY KEY CLUSTERED ([NID] ASC)
);

