CREATE procedure [dbo].[xp_insertLogManTxFromApi]
	@json nvarchar(max),
	@sid int,
	@name nvarchar(255),
	@method nvarchar(255),
	@dop bit = null
as
begin
	set xact_abort on
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try

		if not exists(select * from MSession where SID = @sid) begin
			return
		end

		declare @tmp table ( parameter_name nvarchar(max), value nvarchar(max))  

		insert into @tmp(parameter_name, value)
			select [key], value
			from openjson(@json) 


		begin transaction [xp_insertLogManTxFromApi]

			declare @sp_json nvarchar(max) 

			;with tmp as(
				select v.ordinal, v.param, v.type, v.mode, iif(v.ds_value = '1', dbo.fs_getMD5Encode(t.value), t.value) 'value'
				from @tmp t, vd_SysObjectSL_ISchemeParam v
				where v.name = @name and t.parameter_name = v.param
				and ( v.ds_value in ('0', '1', '') or v.ds_value is null)
			)
			select @sp_json = (
				select ordinal, param, type, mode, value
				from tmp
				order by ordinal
				for json auto, include_null_values    
			)

			declare @spaid int = (select AID from Action where EName = @name)
			exec xp_insertLog @sid, @dop, @sp_json, @spaid, @method

		commit transaction [xp_insertLogManTxFromApi]
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction [xp_insertLogManTxFromApi]
		declare @ErrorMessage As VARCHAR(1000) = CHAR(10)+'錯誤代碼：' +CAST(ERROR_NUMBER() AS VARCHAR)
										+CHAR(10)+'錯誤訊息：'+	ERROR_MESSAGE()
										+CHAR(10)+'錯誤行號：'+	CAST(ERROR_LINE() AS VARCHAR)
										+CHAR(10)+'錯誤程序名稱：'+	ISNULL(ERROR_PROCEDURE(),'')
		declare @ErrorSeverity As Numeric = ERROR_SEVERITY()
		declare @ErrorState As Numeric = ERROR_STATE()
		declare @err_number int = ERROR_NUMBER()
		exec xp_insertLogErr @sid, @ErrorMessage, @err_number, @aid
		RAISERROR( @ErrorMessage, @ErrorSeverity, @ErrorState);--回傳錯誤資訊
	end catch
	set xact_abort off
end