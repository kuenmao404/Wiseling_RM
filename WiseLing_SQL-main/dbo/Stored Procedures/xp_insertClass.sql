CREATE   procedure [dbo].[xp_insertClass]
	@PCID int,				--c.CID，父節點
	@Type int,				--c.Type
	@CName nvarchar(255),	--c.Cname
	@CDes nvarchar(4000),	--c.CDes
	@EName nvarchar(255),
	@EDes nvarchar(4000),
	@OwnerMID int,			--m.Member
	@NewCID int output		--c.CID,新產生的節點，回傳
as
begin
	set @NewCID = null
	declare @_PCID int, @_PNamePath nvarchar(900)
	select @_PCID = CID,  @_PNamePath = NamePath from Class where CID = @PCID

	begin try
		if (@_PCID is not null)
		begin
			declare @_NewNamePath nvarchar(900) = (select dbo.fs_getNamePath(@PCID, @CName))
			if ((select count(*) from Class where NamePath = @_NewNamePath) = 0)
			begin
				declare @_NewCID int
				insert into Class(CName, [Type],CDes, EName, EDes, OwnerMID) values(@CName, @Type, @CDes, @EName, @EDes, @OwnerMID)
				set @_NewCID = SCOPE_IDENTITY()

				insert into Inheritance(PCID, CCID) values(@PCID, @_NewCID)

				insert into Permission
					select @_NewCID, RoleType, RoleID, PermissionBits from Permission where CID = @PCID

				declare @_NewLevel int = (select nLevel + 1 from Class where CID = @PCID)

				update	Class 
				set		nLevel = @_NewLevel,
						NamePath = @_NewNamePath, 
						IDPath = dbo.fs_getIDPath(@PCID, @_NewCID)
				where	CID = @_NewCID

				update Class set bChild = 1 where CID = @PCID
				
				set @NewCID = @_NewCID
			end
			else
			begin
				raiserror('Error: 節點已存在，不得再新增',14,1)
				return
			end
		end
		else
		begin
			raiserror('Error: 沒有PCID',14,1)
			return
		end
	end try
	begin catch
	--系統拋回訊息用
		DECLARE @ErrorMessage As VARCHAR(1000) = 'pcid：' + cast(@pcid as nvarchar(max)) 
												+ CHAR(10) + 'cname：' + @cname  
												+ CHAR(10)+'錯誤代碼：' +CAST(ERROR_NUMBER() AS VARCHAR)
												+CHAR(10)+'錯誤訊息：'+	ERROR_MESSAGE()
												+CHAR(10)+'錯誤行號：'+	CAST(ERROR_LINE() AS VARCHAR)
												+CHAR(10)+'錯誤程序名稱：'+	ISNULL(ERROR_PROCEDURE(),'')
		DECLARE @ErrorSeverity As Numeric = ERROR_SEVERITY()
		DECLARE @ErrorState As Numeric = ERROR_STATE()
		RAISERROR( @ErrorMessage, @ErrorSeverity, @ErrorState);--回傳錯誤資訊
		return
	end catch
end