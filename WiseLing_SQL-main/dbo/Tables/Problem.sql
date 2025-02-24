CREATE TABLE [dbo].[Problem] (
    [PID]          INT            NOT NULL,
    [Difficulty]   INT            NULL,
    [Statement]    NVARCHAR (MAX) NULL,
    [In_spec]      NVARCHAR (MAX) NULL,
    [Out_spec]     NVARCHAR (MAX) NULL,
    [Sample_tests] NVARCHAR (MAX) NULL,
    [Hints]        NVARCHAR (MAX) NULL,
    [Time_limit]   INT            NULL,
    [Mem_limit]    INT            NULL,
    [Keywords]     NVARCHAR (MAX) NULL,
    [OriginID]     NVARCHAR (20)  NULL,
    [ClassID]      INT            NULL,
    [nSubmit]      INT            CONSTRAINT [DF_Problem_nSubmit] DEFAULT ((0)) NULL,
    CONSTRAINT [PK_Problem_PID] PRIMARY KEY CLUSTERED ([PID] ASC) WITH (FILLFACTOR = 80),
    CONSTRAINT [FK_Problem_ClassID] FOREIGN KEY ([ClassID]) REFERENCES [dbo].[Class] ([CID]),
    CONSTRAINT [FK_Problem_PID] FOREIGN KEY ([PID]) REFERENCES [dbo].[Object] ([OID])
);











