using System.Collections.Generic;
using System.Linq;

namespace HamburgueriaApi.Models
{
    public class Pedido
    {
        public List<Produto> Itens { get; set; } = new List<Produto>();
        public decimal Total => Itens.Sum(x => x.Preco);
    }
}