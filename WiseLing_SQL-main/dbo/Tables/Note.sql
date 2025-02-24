CREATE TABLE [dbo].[Note] (
    [NID]            INT        IDENTITY (1, 1) NOT NULL,
    [VID]            INT        NOT NULL,
    [OwnerMID]       INT        NULL,
    [StartTime]      FLOAT (53) NULL,
    [EndTime]        FLOAT (53) NULL,
    [ContentNTID]    INT        NOT NULL,
    [Since]          DATETIME   DEFAULT (getdate()) NULL,
    [LastModifiedDT] DATETIME   DEFAULT (getdate()) NULL,
    [bDel]           BIT        DEFAULT ((0)) NULL,
    CONSTRAINT [PK_Note_NID] PRIMARY KEY CLUSTERED ([NID] ASC),
    CONSTRAINT [FK_Note_ContentNTID] FOREIGN KEY ([ContentNTID]) REFERENCES [dbo].[NText] ([NTID]),
    CONSTRAINT [FK_Note_OwnerMID] FOREIGN KEY ([OwnerMID]) REFERENCES [dbo].[Member] ([MID]),
    CONSTRAINT [FK_Note_VID] FOREIGN KEY ([VID]) REFERENCES [dbo].[Video] ([VID])
);




GO
EXECUTE sp_addextendedproperty @name = N'DS_SL_note_VID', @value = N'0', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Note', @level2type = N'COLUMN', @level2name = N'VID';


GO
EXECUTE sp_addextendedproperty @name = N'DS_SL_Note_EndTime', @value = N'0', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Note', @level2type = N'COLUMN', @level2name = N'EndTime';

