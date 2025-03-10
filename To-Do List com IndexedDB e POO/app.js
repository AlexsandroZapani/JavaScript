// Classe que ajuda a gerenciar o banco de dados IndexedDB
// IndexedDB é um banco de dados local no navegador que permite armazenar dados de forma persistente.
class IndexedDBHelper {
    constructor(dbName, storeName) {
        this.dbName = dbName;       // Nome do banco de dados
        this.storeName = storeName; // Nome da "object store" (uma tabela dentro do banco de dados)
        this.db = null;             // Variável para armazenar a referência ao banco de dados
    }

    // Essa função abre o banco de dados. Se for a primeira vez, ela cria a estrutura necessária.
    openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1); // Abre o banco de dados, versão 1

            request.onupgradeneeded = (event) => {
                let db = event.target.result; // Obtemos o banco de dados
                // Se a object store (tabela) não existir, a criamos
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
                }
            };

            // Quando o banco de dados for aberto com sucesso
            request.onsuccess = (event) => {
                this.db = event.target.result; // Guardamos o banco de dados aberto
                resolve(this.db); // Resolvemos a promessa (a função que chamou openDB saberá que o banco foi aberto)
            };

            // Se ocorrer algum erro ao abrir o banco de dados
            request.onerror = (event) => reject(event.target.error); // Rejeitamos a promessa com o erro
        });
    }

    // Função para adicionar um item (tarefa) ao banco de dados.
    addItem(item) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(this.storeName, 'readwrite'); // Criamos uma transação para escrever no banco
            const store = transaction.objectStore(this.storeName); // Pegamos a object store onde as tarefas estão guardadas
            const request = store.add(item); // Tentamos adicionar o item à store

            // Quando o item for adicionado com sucesso
            request.onsuccess = () => resolve(request.result); // A promessa é resolvida com o ID do item adicionado
            // Se houver erro ao adicionar o item
            request.onerror = () => reject(request.error); // A promessa é rejeitada com o erro
        });
    }

    // Função para obter todos os itens armazenados no banco de dados
    getAllItems() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(this.storeName, 'readonly'); // Criamos uma transação para ler os dados
            const store = transaction.objectStore(this.storeName); // Pegamos a object store
            const request = store.getAll(); // Tentamos pegar todos os itens dessa store

            // Quando conseguimos pegar os itens com sucesso
            request.onsuccess = () => resolve(request.result); // Resolvemos a promessa com todos os itens
            // Se houver erro ao pegar os itens
            request.onerror = () => reject(request.error); // Rejeitamos a promessa com o erro
        });
    }

    // Função para excluir um item do banco de dados pelo ID
    deleteItem(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(this.storeName, 'readwrite'); // Criamos uma transação para escrever no banco
            const store = transaction.objectStore(this.storeName); // Pegamos a object store
            const request = store.delete(id); // Tentamos excluir o item com o ID fornecido

            // Quando o item for excluído com sucesso
            request.onsuccess = () => resolve(); // A promessa é resolvida sem nenhum valor
            // Se houver erro ao excluir o item
            request.onerror = () => reject(request.error); // A promessa é rejeitada com o erro
        });
    }
}

// Classe que representa uma Tarefa
// Cada tarefa tem um título, uma prioridade e um status de conclusão (opcional).
class Tarefa {
    constructor(titulo, prioridade, concluida = false) {
        this.titulo = titulo;      // O título da tarefa
        this.prioridade = prioridade; // A prioridade da tarefa (por exemplo, baixa, média, alta)
        this.concluida = concluida;  // Indica se a tarefa foi concluída ou não
    }
}

// Inicializa o banco de dados e gerencia as tarefas
const dbHelper = new IndexedDBHelper('TarefasDB', 'tarefas'); // Criamos um objeto para gerenciar o banco de dados

// Abrir o banco de dados quando o script for executado
dbHelper.openDB().then(() => {
    console.log("Banco de dados pronto!"); // Mensagem no console quando o banco for aberto com sucesso
});

// Função para adicionar uma tarefa ao banco de dados
function adicionarTarefa() {
    const titulo = document.getElementById('titulo').value; // Pega o título da tarefa do input no HTML
    const prioridade = document.getElementById('prioridade').value; // Pega a prioridade da tarefa do input no HTML
    
    const tarefa = new Tarefa(titulo, prioridade); // Criamos um objeto de tarefa com os dados fornecidos
    dbHelper.addItem(tarefa).then(() => { // Adicionamos a tarefa ao banco de dados
        console.log("Tarefa adicionada!"); // Mensagem no console
        listarTarefas(); // Atualiza a lista de tarefas na página
    });
}

// Função para listar todas as tarefas armazenadas no banco de dados
function listarTarefas() {
    dbHelper.getAllItems().then(tarefas => {
        const lista = document.getElementById('listaTarefas'); // Pegamos o elemento da lista no HTML
        lista.innerHTML = ''; // Limpa a lista para não repetir itens
        tarefas.forEach(tarefa => { // Para cada tarefa no banco de dados
            const li = document.createElement('li'); // Criamos um item de lista
            li.textContent = `${tarefa.titulo} - Prioridade: ${tarefa.prioridade}`; // Definimos o conteúdo do item

            // Criamos um botão para excluir a tarefa
            const btnExcluir = document.createElement('button');
            btnExcluir.textContent = "Excluir"; // Texto do botão
            // Quando o botão for clicado, ele exclui a tarefa
            btnExcluir.onclick = () => excluirTarefa(tarefa.id);

            // Adicionamos o botão de excluir ao item de lista
            li.appendChild(btnExcluir);
            // Adicionamos o item de lista na lista de tarefas na página
            lista.appendChild(li);
        });
    });
}

// Função para excluir uma tarefa do banco de dados
function excluirTarefa(id) {
    dbHelper.deleteItem(id).then(() => { // Tentamos excluir a tarefa com o ID fornecido
        console.log("Tarefa excluída!"); // Mensagem no console
        listarTarefas(); // Atualiza a lista de tarefas na página
    });
}
