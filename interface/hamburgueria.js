let itensNoPedido = [];

const secaoMenu = document.querySelector('.menu');
const secaoPagamento = document.getElementById('pagamento');
const secaoCardapio = document.getElementById('cardapio');

const btnFinalizarCompra = document.getElementById('btn-finalizar');
const btnVoltarPagamento = document.getElementById('voltar-pagamento');
const btnSair = document.getElementById('btn-sair');

function adicionarAoPedido(nome, preco, tempo) {

    itensNoPedido.push({
        nome,
        preco,
        tempoPreparo: tempo
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

    const totalPedido = itensNoPedido.reduce(
        (acc, item) => acc + item.preco,
        0
    );

    const tempoCalculado = itensNoPedido.reduce(
        (acc, item) => acc + Number(item.tempoPreparo || 5),
        0
    );

    const pedidoAtual = [...itensNoPedido];

    alert(
        `Solicitando pagamento via ${metodo} no valor de R$ ${totalPedido.toFixed(2)}...`
    );

    setTimeout(async () => {

        alert("PAGAMENTO APROVADO! 🍔");

        secaoPagamento.style.display = "none";
        secaoMenu.style.display = "block";

        iniciarStatusPedido(tempoCalculado, pedidoAtual);

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

function iniciarStatusPedido(tempoPreparo, pedidoAtual) {

    const rodape = document.querySelector('.rodape-pedido');

    atualizarStatusVisual(
        "🟡 PREPARANDO PEDIDO",
        "#f1c40f"
    );

    setTimeout(() => {

        atualizarStatusVisual(
            "🔵 PEDIDO EM ROTA",
            "#00bfff"
        );

        setTimeout(() => {

            atualizarStatusVisual(
                "🟢 PEDIDO ENTREGUE",
                "#2ecc71"
            );

            setTimeout(() => {

                itensNoPedido = [];

                atualizarInterfacePedido();

                rodape.innerHTML = `

                    <div class="linha-divisoria"></div>

                    <div class="total-container">

                        <span>TOTAL:</span>

                        <span id="valor-total">
                            R$ 0,00
                        </span>

                    </div>

                `;

            }, 5000);

        }, 10000);

    }, tempoPreparo * 1000);
}

function atualizarStatusVisual(texto, cor) {

    const rodape = document.querySelector('.rodape-pedido');

    if (!rodape) return;

    rodape.innerHTML = `

        <div class="linha-divisoria"></div>

        <div
            style="
                text-align:center;
                padding:15px;
                font-weight:bold;
                color:${cor};
                border:2px solid ${cor};
                border-radius:8px;
                margin-top:10px;
                font-family:sans-serif;
                font-size:0.9rem;
                background:rgba(255,255,255,0.03);
                box-shadow:0 0 10px ${cor};
                letter-spacing:1px;
            ">

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