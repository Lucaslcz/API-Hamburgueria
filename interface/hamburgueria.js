let itensNoPedido = [];

const secaoMenu = document.querySelector('.menu');
const secaoPagamento = document.getElementById('pagamento');
const secaoCardapio = document.getElementById('cardapio');
const btnFinalizarCompra = document.getElementById('btn-finalizar');
const btnVoltarPagamento = document.getElementById('voltar-pagamento');
const btnSair = document.getElementById('btn-sair');
const btnHistorico = document.getElementById('btn-historico');

function adicionarAoPedido(nome, preco, tempo) {
    itensNoPedido.push({ nome, preco, tempoPreparo: tempo });
    atualizarInterfacePedido();
}

function removerDoPedido(index) {
    itensNoPedido.splice(index, 1);
    atualizarInterfacePedido();
}

function atualizarInterfacePedido() {
    const container = document.getElementById('itens-pedido');
    const totalElemento = document.getElementById('valor-total');
    
    if (!container || !totalElemento) return;

    if (itensNoPedido.length === 0) {
        container.innerHTML = '<p class="vazio">O carrinho está vazio.</p>';
        totalElemento.innerText = 'R$ 0,00';
        return;
    }

    container.innerHTML = itensNoPedido.map((item, index) => `
        <div class="item-carrinho" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; background:#1a1a1a; padding:10px; border-radius:5px; border: 1px solid #333;">
            <div style="display:flex; flex-direction:column;">
                <span style="font-weight:bold; color:white; font-size:0.9rem;">${item.nome}</span>
                <span style="color:#2ecc71; font-size:0.85rem;">R$ ${item.preco.toFixed(2)}</span>
            </div>
            <button onclick="removerDoPedido(${index})" style="background:#eb4f4f; border:none; color:white; padding:5px 8px; border-radius:4px; cursor:pointer;">🗑️</button>
        </div>
    `).join('');

    const total = itensNoPedido.reduce((acc, item) => acc + item.preco, 0);
    totalElemento.innerText = `R$ ${total.toFixed(2)}`;
}

async function processarPagamento(metodo) {
    const totalPedido = itensNoPedido.reduce((acc, item) => acc + item.preco, 0);
    const tempoCalculado = itensNoPedido.reduce((acc, item) => acc + (item.tempoPreparo || 5), 0);
    
    alert(`Solicitando pagamento via ${metodo} no valor de R$ ${totalPedido.toFixed(2)}...`);

    setTimeout(async () => {
        alert("PAGAMENTO APROVADO! 🍔");

        secaoPagamento.style.display = "none";
        secaoMenu.style.display = "block";

        iniciarStatusPedido(tempoCalculado);

        try {
            await fetch('http://localhost:5000/api/pedidos/finalizar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ metodo: metodo, itens: itensNoPedido, total: totalPedido })
            });
        } catch (e) {
            console.log("Erro de conexão com a API.");
        }
    }, 1000);
}

function iniciarStatusPedido(tempoPreparo) {
    const rodape = document.querySelector('.rodape-pedido');
    
    atualizarStatusVisual("PREPARANDO PEDIDO", "#f1c40f");

    setTimeout(() => {
        atualizarStatusVisual("PEDIDO EM ROTA", "#00ffff");

        setTimeout(() => {
            atualizarStatusVisual("PEDIDO ENTREGUE", "#2ecc71");

            setTimeout(() => {
                itensNoPedido = [];
                const containerItens = document.getElementById('itens-pedido');
                if(containerItens) containerItens.innerHTML = '<p class="vazio">O carrinho está vazio.</p>';
                
                rodape.innerHTML = `
                    <div class="linha-divisoria"></div>
                    <div class="total-container">
                        <span>TOTAL:</span>
                        <span id="valor-total">R$ 0,00</span>
                    </div>`;
            }, 5000);
        }, 10000);
    }, tempoPreparo * 1000);
}

function atualizarStatusVisual(texto, cor) {
    const rodape = document.querySelector('.rodape-pedido');
    if (!rodape) return;
    
    rodape.innerHTML = `
        <div class="linha-divisoria"></div>
        <div style="text-align:center; padding:15px; font-weight:bold; color:${cor}; border:2px solid ${cor}; border-radius:5px; margin-top:10px; font-family: sans-serif; font-size: 0.8rem;">
            ${texto}
        </div>
    `;
}

if (btnHistorico) {
    btnHistorico.onclick = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/pedidos/historico');
            if (!res.ok) throw new Error();
            const dados = await res.json();
            abrirModalHistorico(dados);
        } catch (e) {
            alert("Erro ao abrir histórico. Verifique se o servidor C# está rodando.");
        }
    };
}

function abrirModalHistorico(compras) {
    const modal = document.createElement('div');
    modal.style = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:9999;display:flex;align-items:center;justify-content:center;font-family:sans-serif;";
    modal.innerHTML = `
        <div style="background:#121212; width:85%; height:85%; display:flex; border:1px solid #333; position:relative; border-radius:10px; overflow:hidden;">
            <button onclick="this.parentElement.parentElement.remove()" style="position:absolute;right:15px;top:10px;color:white;background:none;border:none;font-size:24px;cursor:pointer;">&times;</button>
            <div style="width:30%; border-right:1px solid #333; padding:20px; overflow-y:auto; background:#1a1a1a;">
                <h3 style="color:#00ffff; margin-bottom:15px;">Histórico</h3>
                ${compras.map((p, i) => `
                    <div onclick='exibirDetalhesPedidoHist(${JSON.stringify(p)})' style="padding:15px; background:#222; margin-top:10px; cursor:pointer; border-radius:5px; color:white; border-left:4px solid #f1c40f;">
                        Pedido #${i+1}<br><small>R$ ${p.total.toFixed(2)}</small>
                    </div>
                `).join('')}
            </div>
            <div id="detalhe-hist-container" style="width:70%; padding:40px; color:white; overflow-y:auto;">
                <p style="text-align:center; color:#555; margin-top:100px;">Selecione um pedido para ver os detalhes.</p>
            </div>
        </div>`;
    document.body.appendChild(modal);
}

function exibirDetalhesPedidoHist(p) {
    const container = document.getElementById('detalhe-hist-container');
    container.innerHTML = `
        <h2 style="color:#f1c40f; margin-bottom:10px;">Detalhes do Pedido</h2>
        <p><strong>Método de Pagamento:</strong> ${p.metodo}</p>
        <hr style="border:0; border-top:1px solid #333; margin:20px 0;">
        ${p.itens.map(i => `
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span>${i.nome}</span>
                <span style="color:#2ecc71;">R$ ${i.preco.toFixed(2)}</span>
            </div>
        `).join('')}
        <h3 style="text-align:right; color:#00ffff; margin-top:30px; border-top:1px solid #333; padding-top:10px;">TOTAL: R$ ${p.total.toFixed(2)}</h3>`;
}

if (btnFinalizarCompra) {
    btnFinalizarCompra.onclick = () => {
        if (itensNoPedido.length === 0) return alert("Carrinho vazio!");
        secaoMenu.style.display = "none";
        secaoPagamento.style.display = "block";
    };
}

if (btnVoltarPagamento) {
    btnVoltarPagamento.onclick = () => {
        secaoPagamento.style.display = "none";
        secaoMenu.style.display = "block";
    };
}

if (btnSair) {
    btnSair.onclick = () => {
        if (confirm("Deseja realmente sair?")) window.close();
    };
}