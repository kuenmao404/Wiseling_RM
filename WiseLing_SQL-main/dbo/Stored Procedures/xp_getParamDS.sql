CREATE   procedure [dbo].[xp_getParamDS]
	@name nvarchar(255)
as
begin
	begin try
		if OBJECT_ID('tempdb..#tmp') is not null drop table #tmp;

		select '_' + column_name 'column_name',  cast(ds_value as nvarchar(50)) 'ds_value'
		into #tmp
		from vd_SystemObjectAllSL 
		where [name] = @name
		order by column_id


		declare @columnGroup nvarchar(max) = ''

		select @columnGroup = @columnGroup +  ', ' +  column_name from #tmp

		select @columnGroup = substring(@columnGroup, 2, len(@columnGroup))

		declare @PivotSQL NVARCHAR(MAX)

		SET @PivotSQL = N'
			SELECT  ' + @ColumnGroup + N' FROM (
				SELECT column_name, ds_value
				FROM #tmp
			) AS SourceTable
			PIVOT
			(
				MAX(ds_value)
				FOR column_name IN ( ' + @ColumnGroup + N')
			) AS PivotTable
		'

		EXEC sp_executesql @PivotSQL

		drop table #tmp
	end try
	begin catch
		declare @ErrorMessage As VARCHAR(1000) = CHAR(10)+'錯誤代碼：' +CAST(ERROR_NUMBER() AS VARCHAR)
										+CHAR(10)+'錯誤訊息：'+	ERROR_MESSAGE()
										+CHAR(10)+'錯誤行號：'+	CAST(ERROR_LINE() AS VARCHAR)
										+CHAR(10)+'錯誤程序名稱：'+	ISNULL(ERROR_PROCEDURE(),'')
		declare @ErrorSeverity As Numeric = ERROR_SEVERITY()
		declare @ErrorState As Numeric = ERROR_STATE()
		declare @err_number int = ERROR_NUMBER()

		RAISERROR( @ErrorMessage, @ErrorSeverity, @ErrorState);--回傳錯誤資訊
	end catch
end