using WiseLing_API.Middleware;
using Microsoft.Extensions.Localization;
using Microsoft.OpenApi.Models;
using System.Reflection;
using WiseLing_API.Filter;
using Microsoft.AspNetCore.Mvc;
using WiseLing_API.Model;
using WiseLing_API.Lib;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    WebRootPath = "ClientApp"
});

ConfigurationManager configuration = builder.Configuration;

//CORS設定，從appsettings來
string[] corsOrigins = configuration["CORS:AllowOrigin"].Split(',', StringSplitOptions.RemoveEmptyEntries);
if (corsOrigins.Length > 0)
{
    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(
            builder =>
            {
                if (corsOrigins.Contains("*"))
                {
                    builder.SetIsOriginAllowed(_ => true);
                }
                else
                {
                    builder.WithOrigins(corsOrigins);
                }
                builder.AllowAnyMethod();
                builder.AllowAnyHeader();
                builder.AllowCredentials();

            });
    });
}

//header設定
builder.Services.AddHsts(options =>
{
    options.Preload = true;
    options.IncludeSubDomains = true;
    options.MaxAge = TimeSpan.FromDays(60);
});

// 配置 HttpClient 並設置 Timeout
builder.Services.AddHttpClient("MyHttpClient", client =>
{
    client.Timeout = TimeSpan.FromSeconds(20);
});

// swagger
builder.Services.AddControllers(options =>
{
    options.Filters.Add<ResultFilter>();
});

// 通過資安檢測某一項
builder.Services.AddMvcCore().AddMvcOptions(options =>
{
    var L = builder.Services.BuildServiceProvider().GetService<IStringLocalizer>();
    options.ModelBindingMessageProvider.SetAttemptedValueIsInvalidAccessor((x, y) => $"The value is not valid.");
    options.ModelBindingMessageProvider.SetNonPropertyAttemptedValueIsInvalidAccessor(x => "The value is not valid.");
    options.ModelBindingMessageProvider.SetValueIsInvalidAccessor(x => "The value is invalid.");
    options.ModelBindingMessageProvider.SetValueMustNotBeNullAccessor(x => "不能為空");
    options.ModelBindingMessageProvider.SetMissingBindRequiredValueAccessor(x => "不能為空");
    options.ModelBindingMessageProvider.SetValueMustBeANumberAccessor(x => "The value is invalid.");
    options.ModelBindingMessageProvider.SetMissingRequestBodyRequiredValueAccessor(() => L["不能為空"]);
    options.ModelBindingMessageProvider.SetUnknownValueIsInvalidAccessor(x => "The value is invalid.");
    options.ModelBindingMessageProvider.SetMissingKeyOrValueAccessor(() => L["The value is invalid."]);
});

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = actionContext =>
    {
        actionContext.HttpContext.Response.Headers["X-ERROR-CODE"] = "Format.ModelInvalid";

        var InvalidModelResponse = new ValidationProblemDetails(actionContext.ModelState);

        var modelType = actionContext.ActionDescriptor.Parameters.FirstOrDefault(p => p.Name == "body")?.ParameterType;

        string tmp = "";

        List<ErrorParam> errorArray = new List<ErrorParam>();

        InvalidModelResponse.Errors
            .ToList()
            .ForEach(v => 
                errorArray.Add(
                    new ErrorParam
                    {
                        field = v.Key,
                        displayName = new Fn().getDisplayname(modelType, v.Key, actionContext),
                        error = v.Value[0]
                    }));

        InvalidModelBinding invalidModelBinding = new InvalidModelBinding
        {
            status = false,
            statusCode = 400,
            errorArray = errorArray
        };

        return new BadRequestObjectResult(invalidModelBinding);
    };
});


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "WiseLing API文件", Version = "v1", Description  = "[WiseLing API](https://hackmd.wke.csie.ncnu.edu.tw/SQyecrjQTsq0ZnLsP9IjWA)" });

    var assembly = Assembly.GetExecutingAssembly();
    var xmlFile = $"{assembly.GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);

    c.IncludeXmlComments(xmlPath);
});

builder.Services.AddScoped<DIModel>();
builder.Services.AddScoped<UUIDModel>();
builder.Services.AddScoped<UUID2TxSPAuthFilter>();
builder.Services.AddScoped<UUID2PublicSPFilter>();
builder.Services.AddScoped<UUID2PublicViewAuthFilter>();
builder.Services.AddScoped<UUID2TxViewAuthFilter>(); 

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

#if DEBUG
app.UseSwagger();
app.UseSwaggerUI();
#endif

app.UseHsts();
app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseCors();

app.UseMiddleware<ErrorLogMiddleware>();

app.UseWhen(
    context => context.Request.Path.StartsWithSegments("/api") || context.Request.Path.StartsWithSegments("/assets"),
    appBuilder =>
    {
        appBuilder.UseMiddleware<MidMiddleware>();
        appBuilder.UseMiddleware<LogMiddleware>();
        //appBuilder.UseMiddleware<DataprepperMiddleware>();
    }
);

app.UseAuthorization();

app.MapControllers();

app.UseSpa(spa =>
{
    spa.Options.SourcePath = "ClientApp";
});

app.Run();
