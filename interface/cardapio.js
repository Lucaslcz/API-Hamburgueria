const btnVerCardapio = document.getElementById('btn-ver-cardapio');
const btnFecharCardapio = document.getElementById('fechar-cardapio');
const gridCardapio = document.getElementById('lista-produtos-cardapio');

const URL_API = "http://localhost:5000/api/produtos"; 

if (btnVerCardapio) {
    btnVerCardapio.onclick = async () => {
        secaoMenu.style.display = 'none';
        secaoCardapio.style.display = 'block';
        await carregarProdutosDoBackend();
    };
}

if (btnFecharCardapio) {
    btnFecharCardapio.onclick = () => {
        secaoCardapio.style.display = 'none';
        secaoMenu.style.display = 'block';
    };
}

async function carregarProdutosDoBackend() {
    try {
        const response = await fetch(URL_API);
        const produtos = await response.json();
        if (!gridCardapio) return;
        gridCardapio.innerHTML = '';
        const categorias = produtos.reduce((acc, p) => {
            const cat = p.categoria || "Outros";
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(p);
            return acc;
        }, {});
        for (const cat in categorias) {
            const h2 = document.createElement('h2');
            h2.innerText = cat.toUpperCase();
            h2.style.color = "#00ffff";
            h2.style.margin = "20px 0";
            h2.style.borderBottom = "1px solid #00ffff";
            gridCardapio.appendChild(h2);
            categorias[cat].forEach(p => {
                const div = document.createElement('div');
                div.className = 'produto-item';
                div.innerHTML = `
                    <div class="produto-info">
                        <h3>${p.nome}</h3>
                        <p>R$ ${p.preco.toFixed(2)}</p>
                    </div>
                    <button class="btn-add" onclick="adicionarAoPedido('${p.nome}', ${p.preco}, ${p.tempoPreparo})">+</button>
                `;
                gridCardapio.appendChild(div);
            });
        }
    } catch (e) { console.error(e); }
}