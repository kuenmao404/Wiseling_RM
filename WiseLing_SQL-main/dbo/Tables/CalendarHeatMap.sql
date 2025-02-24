CREATE TABLE [dbo].[CalendarHeatMap] (
    [MapID] INT  IDENTITY (1, 1) NOT NULL,
    [CID]   INT  NOT NULL,
    [Date]  DATE DEFAULT (getdate()) NOT NULL,
    [nC]    INT  DEFAULT ((0)) NOT NULL,
    CONSTRAINT [PK_CalendarHeatMap_MapID] PRIMARY KEY CLUSTERED ([MapID] ASC),
    CONSTRAINT [FK_CalendarHeatMap_CID] FOREIGN KEY ([CID]) REFERENCES [dbo].[Class] ([CID]),
    CONSTRAINT [UQ_CalendarHeatMap] UNIQUE NONCLUSTERED ([CID] ASC, [Date] ASC)
);

