const btnHistorico = document.getElementById('btn-historico');
const modalHist = document.getElementById('modal-historico');
const btnFecharHist = document.getElementById('fechar-modal-hist');
const listaContainer = document.getElementById('scroll-pedidos');
const detalheContainer = document.getElementById('detalhe-hist-container');

if (btnHistorico) {
    btnHistorico.onclick = () => {
        modalHist.style.display = 'flex';
        buscarDados();
    };
}

if (btnFecharHist) {
    btnFecharHist.onclick = () => {
        modalHist.style.display = 'none';
    };
}

async function buscarDados() {
    listaContainer.innerHTML = '<p class="msg-status"></p>';
    detalheContainer.innerHTML = '<div class="placeholder-detalhes"><p>Selecione um pedido.</p></div>';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort();
        listaContainer.innerHTML = '<p class="msg-status erro">SERVIDOR OFFLINE</p>';
    }, 5000);

    try {
        const res = await fetch('http://localhost:5000/api/pedidos/historico', { 
            signal: controller.signal 
        });
        
        const compras = await res.json();
        clearTimeout(timeoutId);

        if (!compras || compras.length === 0) {
            listaContainer.innerHTML = '<p class="msg-status" style="color: #888;">Nenhum pedido encontrado.</p>';
            return;
        }

        listaContainer.innerHTML = compras.map((p, i) => `
            <div class="card-pedido-hist" onclick='exibirDetalhes(${JSON.stringify(p)})'>
                <span>Pedido #${i + 1}</span>
                <span class="valor-verde">R$ ${p.total.toFixed(2)}</span>
            </div>
        `).join('');

    } catch (e) {
        if (e.name !== 'AbortError') {
            clearTimeout(timeoutId);
            listaContainer.innerHTML = '<p class="msg-status erro">SERVIDOR OFFLINE</p>';
        }
    }
}

function exibirDetalhes(p) {
    detalheContainer.innerHTML = `
        <h2 class="detalhe-titulo">Detalhes</h2>
        <div class="status-info">Status: <span class="status-concluido">Finalizado</span></div>
        <hr class="divisor-hr">
        <div class="lista-itens-detalhe">
            ${p.itens.map(i => `
                <div class="item-linha">
                    <span>${i.nome}</span>
                    <span class="valor-verde">R$ ${i.preco.toFixed(2)}</span>
                </div>
            `).join('')}
        </div>
        <div class="total-detalhe">TOTAL: R$ ${p.total.toFixed(2)}</div>
    `;
}