﻿using System.Text.Json;
using HamburgueriaApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddCors(options => {
    options.AddPolicy("PermitirTudo", policy => {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("PermitirTudo");

app.MapGet("/api/produtos", () => {
    var caminhoArquivo = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "cardapio.json");
    if (File.Exists(caminhoArquivo)) {
        string jsonString = File.ReadAllText(caminhoArquivo);
        var opcoes = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var cardapio = JsonSerializer.Deserialize<List<Produto>>(jsonString, opcoes);
        return Results.Ok(cardapio);
    }
    return Results.NotFound(new { erro = "Arquivo nao encontrado" });
});

app.MapControllers();

app.Run();