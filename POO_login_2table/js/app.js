let db;

// Função para abrir o banco de dados e criar as tabelas
function abrirBanco() {
    let request = indexedDB.open('loja', 1); // Banco de dados 'loja', versão 1

    request.onupgradeneeded = function(event) {
        db = event.target.result;

        // Criação da tabela de usuários
        if (!db.objectStoreNames.contains('users')) {
            let userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
            userStore.createIndex('name', 'name', { unique: false });
        }

        // Criação da tabela de produtos
        if (!db.objectStoreNames.contains('products')) {
            let productStore = db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
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
    let nome = document.getElementById('inputUsuarioNome').value;
    let idade = parseInt(document.getElementById('inputUsuarioIdade').value);

    if (!nome || isNaN(idade)) {
        alert('Por favor, preencha todos os campos de usuário.');
        return;
    }

    let transaction = db.transaction(['users'], 'readwrite');
    let store = transaction.objectStore('users');

    let usuario = { name: nome, idade: idade };

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
    let nome = document.getElementById('inputProdutoNome').value;
    let preco = parseFloat(document.getElementById('inputProdutoPreco').value);

    if (!nome || isNaN(preco)) {
        alert('Por favor, preencha todos os campos de produto.');
        return;
    }

    let transaction = db.transaction(['products'], 'readwrite');
    let store = transaction.objectStore('products');

    let produto = { name: nome, preco: preco };

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
    let transaction = db.transaction(['users'], 'readonly');
    let store = transaction.objectStore('users');
    let request = store.getAll();

    request.onsuccess = function(event) {
        let usuarios = event.target.result;
        let lista = document.getElementById('listaUsuarios');
        lista.innerHTML = '';

        usuarios.forEach(usuario => {
            let li = document.createElement('li');
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
    let transaction = db.transaction(['products'], 'readonly');
    let store = transaction.objectStore('products');
    let request = store.getAll();

    request.onsuccess = function(event) {
        let produtos = event.target.result;
        let lista = document.getElementById('listaProdutos');
        lista.innerHTML = '';

        produtos.forEach(produto => {
            let li = document.createElement('li');
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

    let usuario = document.getElementById('usuario').value;
    let senha = document.getElementById('senha').value;

    // Exemplo de dados de login fixos (substitua com uma lógica de autenticação real)
    let usuarioValido = 'admin';
    let senhaValida = '1234';

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
