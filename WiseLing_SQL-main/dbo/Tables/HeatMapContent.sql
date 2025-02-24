CREATE TABLE [dbo].[HeatMapContent] (
    [HID]            INT      IDENTITY (1, 1) NOT NULL,
    [Type]           SMALLINT NOT NULL,
    [ID]             INT      NOT NULL,
    [Datatype]       TINYINT  NOT NULL,
    [bDel]           BIT      CONSTRAINT [DF_HeatMapContent_bDel] DEFAULT ((0)) NULL,
    [Since]          DATETIME CONSTRAINT [DF_HeatMapContent_Since] DEFAULT (getdate()) NULL,
    [Duration]       INT      NULL,
    [NTID]           INT      NULL,
    [NTLen]          INT      NULL,
    [LastModifiedDT] DATETIME DEFAULT (getdate()) NULL,
    [MID]            INT      NULL,
    CONSTRAINT [PK_HeatMapContent_HID] PRIMARY KEY CLUSTERED ([HID] ASC),
    CONSTRAINT [FK_HeatMapContent_MID] FOREIGN KEY ([MID]) REFERENCES [dbo].[Member] ([MID]),
    CONSTRAINT [FK_HeatMapContent_Type] FOREIGN KEY ([Type]) REFERENCES [dbo].[Entity] ([EID])
);



















