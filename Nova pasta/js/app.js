let db;

// Função para abrir o banco de dados e criar as tabelas
function abrirBanco() {
    const request = indexedDB.open('loja', 1); // Banco de dados 'loja', versão 1

    request.onupgradeneeded = function(event) {
        db = event.target.result;

        // Criação da tabela de usuários
        if (!db.objectStoreNames.contains('users')) {
            const userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
            userStore.createIndex('name', 'name', { unique: false });
        }

        // Criação da tabela de produtos
        if (!db.objectStoreNames.contains('products')) {
            const productStore = db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
            productStore.createIndex('name', 'name', { unique: false });
        }
    };

    request.onsuccess = function(event) {
        db = event.target.result;
    };

    request.onerror = function(event) {
        console.error('Erro ao abrir o banco de dados:', event.target.error);
    };
}

// Função para gravar um usuário no banco
function gravarUsuario() {
    const nome = document.getElementById('inputUsuarioNome').value;
    const idade = parseInt(document.getElementById('inputUsuarioIdade').value);

    if (!nome || isNaN(idade)) {
        alert('Por favor, preencha todos os campos de usuário.');
        return;
    }

    const transaction = db.transaction(['users'], 'readwrite');
    const store = transaction.objectStore('users');

    const usuario = { name: nome, idade: idade };

    store.add(usuario);

    transaction.oncomplete = function() {
        console.log('Usuário gravado!');
        document.getElementById('inputUsuarioNome').value = '';
        document.getElementById('inputUsuarioIdade').value = '';
    };

    transaction.onerror = function(event) {
        console.error('Erro ao gravar usuário:', event.target.error);
    };
}

// Função para gravar um produto no banco
function gravarProduto() {
    const nome = document.getElementById('inputProdutoNome').value;
    const preco = parseFloat(document.getElementById('inputProdutoPreco').value);

    if (!nome || isNaN(preco)) {
        alert('Por favor, preencha todos os campos de produto.');
        return;
    }

    const transaction = db.transaction(['products'], 'readwrite');
    const store = transaction.objectStore('products');

    const produto = { name: nome, preco: preco };

    store.add(produto);

    transaction.oncomplete = function() {
        console.log('Produto gravado!');
        document.getElementById('inputProdutoNome').value = '';
        document.getElementById('inputProdutoPreco').value = '';
    };

    transaction.onerror = function(event) {
        console.error('Erro ao gravar produto:', event.target.error);
    };
}

// Função para ler todos os usuários do banco
function lerUsuarios() {
    const transaction = db.transaction(['users'], 'readonly');
    const store = transaction.objectStore('users');
    const request = store.getAll();

    request.onsuccess = function(event) {
        const usuarios = event.target.result;
        const lista = document.getElementById('listaUsuarios');
        lista.innerHTML = '';

        usuarios.forEach(usuario => {
            const li = document.createElement('li');
            li.textContent = `${usuario.name} - Idade: ${usuario.idade}`;
            lista.appendChild(li);
        });
    };

    request.onerror = function(event) {
        console.error('Erro ao ler usuários:', event.target.error);
    };
}

// Função para ler todos os produtos do banco
function lerProdutos() {
    const transaction = db.transaction(['products'], 'readonly');
    const store = transaction.objectStore('products');
    const request = store.getAll();

    request.onsuccess = function(event) {
        const produtos = event.target.result;
        const lista = document.getElementById('listaProdutos');
        lista.innerHTML = '';

        produtos.forEach(produto => {
            const li = document.createElement('li');
            li.textContent = `${produto.name} - Preço: R$ ${produto.preco}`;
            lista.appendChild(li);
        });
    };

    request.onerror = function(event) {
        console.error('Erro ao ler produtos:', event.target.error);
    };
}

// 🔐 Função para login
function verificarLogin(event) {
    event.preventDefault(); // Evita o envio do formulário

    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;

    // Exemplo de dados de login fixos (substitua com uma lógica de autenticação real)
    const usuarioValido = 'admin';
    const senhaValida = '1234';

    if (usuario === usuarioValido && senha === senhaValida) {
        localStorage.setItem('loggedIn', true); // Marca como logado
        window.location.href = 'index.html'; // Redireciona para a tela principal
    } else {
        document.getElementById('mensagemErro').textContent = 'Usuário ou senha incorretos!';
    }
}

// 🔒 Verifica se o usuário está logado antes de acessar a página principal
if (!localStorage.getItem('loggedIn') && window.location.href.includes('index.html')) {
    window.location.href = 'login.html'; // Redireciona para a tela de login
}

// 🔄 Chama a função para abrir o banco de dados quando a página carrega
abrirBanco();

// 📌 Se estiver na página de login, adiciona o evento de submissão ao formulário
if (window.location.href.includes('login.html')) {
    document.getElementById('loginForm').addEventListener('submit', verificarLogin);
}
