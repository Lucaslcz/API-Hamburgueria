using Microsoft.AspNetCore.Mvc;
using HamburgueriaApi.Models;
using System.Text.Json;

namespace HamburgueriaApi.Controllers
{
    [ApiController]
    [Route("api/pedidos")]
    public class PedidosController : ControllerBase
    {
        private readonly string _caminho = "historico.json";

        [HttpGet("historico")]
        public IActionResult GetHistorico()
        {
            if (!System.IO.File.Exists(_caminho)) return Ok(new List<Pedido>());
            var json = System.IO.File.ReadAllText(_caminho);
            return Content(json, "application/json");
        }

        [HttpPost("finalizar")]
        public IActionResult Finalizar([FromBody] Pedido pedido)
        {
            var lista = new List<Pedido>();
            if (System.IO.File.Exists(_caminho))
            {
                var antigo = System.IO.File.ReadAllText(_caminho);
                lista = JsonSerializer.Deserialize<List<Pedido>>(antigo) ?? new List<Pedido>();
            }
            lista.Add(pedido);
            System.IO.File.WriteAllText(_caminho, JsonSerializer.Serialize(lista));
            return Ok(new { status = "sucesso" });
        }
    }
}