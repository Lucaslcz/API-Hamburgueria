let itensNoPedido = [];

const secaoMenu = document.querySelector('.menu');
const secaoPagamento = document.getElementById('pagamento');
const secaoCardapio = document.getElementById('cardapio');

const btnFinalizarCompra = document.getElementById('btn-finalizar');
const btnVoltarPagamento = document.getElementById('voltar-pagamento');
const btnSair = document.getElementById('btn-sair');

window.pagamentoProcessando = false;

function adicionarAoPedido(nome, preco, tempo) {

    console.log(nome, preco, tempo);

    itensNoPedido.push({
        nome,
        preco,
        tempoPreparo: Number(tempo)
    });

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

        container.innerHTML =
            '<p class="vazio">O carrinho está vazio.</p>';

        totalElemento.innerText = 'R$ 0,00';

        return;
    }

    container.innerHTML = itensNoPedido.map((item, index) => `

        <div class="item-carrinho">

            <div class="item-carrinho-info">

                <span class="item-carrinho-nome">
                    ${item.nome}
                </span>

                <span class="item-carrinho-preco">
                    R$ ${item.preco.toFixed(2)}
                </span>

            </div>

            <button
                onclick="removerDoPedido(${index})"
                class="btn-remover-item">

                🗑️

            </button>

        </div>

    `).join('');

    const total = itensNoPedido.reduce(
        (acc, item) => acc + item.preco,
        0
    );

    totalElemento.innerText = `R$ ${total.toFixed(2)}`;
}

async function processarPagamento(metodo) {

    if (window.pagamentoProcessando) return;

    window.pagamentoProcessando = true;

    const totalPedido = itensNoPedido.reduce(
        (acc, item) => acc + item.preco,
        0
    );

    const tempoCalculado = itensNoPedido.reduce(
        (acc, item) => acc + Number(item.tempoPreparo || 5),
        0
    );

    console.log("TEMPO:", tempoCalculado);

    const pedidoAtual = [...itensNoPedido];

    alert(
        `Solicitando pagamento via ${metodo} no valor de R$ ${totalPedido.toFixed(2)}...`
    );

    setTimeout(async () => {

        alert("PAGAMENTO APROVADO! 🍔");

        secaoPagamento.style.display = "none";
        secaoMenu.style.display = "block";

        iniciarStatusPedido(tempoCalculado);

        try {

            await fetch('http://localhost:5000/api/pedidos/finalizar', {

                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    metodo: metodo,
                    itens: pedidoAtual,
                    total: totalPedido
                })

            });

        } catch (e) {

            console.log("Erro de conexão com a API.");
        }

    }, 1000);
}

function iniciarStatusPedido(tempoPreparo) {

    console.log("INICIOU STATUS");

    atualizarStatusVisual(
        "🟡 PREPARANDO PEDIDO",
        "status-preparando"
    );

    setTimeout(() => {

        console.log("EM ROTA");

        atualizarStatusVisual(
            "🔵 PEDIDO EM ROTA",
            "status-rota"
        );

        setTimeout(() => {

            console.log("ENTREGUE");

            atualizarStatusVisual(
                "🟢 PEDIDO ENTREGUE",
                "status-entregue"
            );

            setTimeout(() => {

                console.log("LIMPOU");

                itensNoPedido = [];

                atualizarInterfacePedido();

                document.getElementById('status-pedido').innerHTML = '';

                window.pagamentoProcessando = false;

            }, 5000);

        }, 10000);

    }, tempoPreparo * 1000);
}

function atualizarStatusVisual(texto, classe) {

    const status = document.getElementById('status-pedido');

    if (!status) return;

    status.innerHTML = `
        <div class="status-box ${classe}">
            ${texto}
        </div>
    `;
}

if (btnFinalizarCompra) {

    btnFinalizarCompra.onclick = () => {

        if (itensNoPedido.length === 0) {

            return alert("Carrinho vazio!");
        }

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

        if (confirm("Deseja realmente sair?")) {

            window.close();
        }
    };
}