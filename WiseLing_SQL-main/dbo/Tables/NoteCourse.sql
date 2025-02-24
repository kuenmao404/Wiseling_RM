CREATE TABLE [dbo].[NoteCourse] (
    [NID]            INT        IDENTITY (1, 1) NOT NULL,
    [CourseCID]      INT        NOT NULL,
    [VID]            INT        NOT NULL,
    [OwnerMID]       INT        NULL,
    [StartTime]      FLOAT (53) NULL,
    [EndTime]        FLOAT (53) NULL,
    [ContentNTID]    INT        NOT NULL,
    [Since]          DATETIME   DEFAULT (getdate()) NULL,
    [LastModifiedDT] DATETIME   DEFAULT (getdate()) NULL,
    [bDel]           BIT        DEFAULT ((0)) NULL,
    CONSTRAINT [PK_NoteCourse_NID] PRIMARY KEY CLUSTERED ([NID] ASC),
    CONSTRAINT [FK_NoteCourse_ContentNTID] FOREIGN KEY ([ContentNTID]) REFERENCES [dbo].[NText] ([NTID]),
    CONSTRAINT [FK_NoteCourse_CourseCID] FOREIGN KEY ([CourseCID]) REFERENCES [dbo].[Class] ([CID]),
    CONSTRAINT [FK_NoteCourse_OwnerMID] FOREIGN KEY ([OwnerMID]) REFERENCES [dbo].[Member] ([MID]),
    CONSTRAINT [FK_NoteCourse_VID] FOREIGN KEY ([VID]) REFERENCES [dbo].[Video] ([VID])
);

