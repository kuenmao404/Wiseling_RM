CREATE TABLE [dbo].[Post] (
    [PID]     INT            NOT NULL,
    [Detail]  NVARCHAR (MAX) NULL,
    [StartDT] DATETIME       DEFAULT (getdate()) NULL,
    [EndDT]   DATETIME       NULL,
    CONSTRAINT [PK_Post] PRIMARY KEY CLUSTERED ([PID] ASC),
    CONSTRAINT [FK_Post_PID] FOREIGN KEY ([PID]) REFERENCES [dbo].[Object] ([OID])
);

