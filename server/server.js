import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Middleware para parsing de JSON
app.use(express.json());

// Middleware para parsing de formulários
app.use(express.urlencoded({ extended: true }));

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite de 5MB
  },
  fileFilter: (req, file, cb) => {
    // Aceitar apenas imagens
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos!'));
    }
  }
});

// Diretório para armazenar imagens
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Servir arquivos de upload
app.use('/uploads', express.static(uploadDir));

// Banco de dados será inicializado depois
let db;

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Endpoint para pegar produtos
app.get('/api/produtos', async (req, res) => {
  try {
    const produtos = await db.all('SELECT * FROM produtos');
    res.json(produtos);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// Endpoint para criar pedido
app.post('/api/pedidos', async (req, res) => {
  try {
    const { cliente, itens, total } = req.body;
    
    // Inserir pedido
    const result = await db.run(
      'INSERT INTO pedidos (cliente_nome, cliente_telefone, cliente_endereco, forma_pagamento, total, data) VALUES (?, ?, ?, ?, ?, datetime("now"))',
      [cliente.nome, cliente.telefone, cliente.endereco, cliente.pagamento, total]
    );
    
    const pedidoId = result.lastID;
    
    // Inserir itens do pedido
    for (const item of itens) {
      await db.run(
        'INSERT INTO pedido_itens (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
        [pedidoId, item.produto.id, item.quantidade, item.produto.preco]
      );
    }
    
    res.json({ 
      success: true, 
      pedidoId: pedidoId,
      message: 'Pedido criado com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: 'Erro ao criar pedido' });
  }
});

// Endpoint para atualizar produto com imagem (URL)
app.post('/api/produtos/:id/imagem', async (req, res) => {
  try {
    const { id } = req.params;
    const { imagem } = req.body;
    
    // Atualizar produto com a URL da imagem
    await db.run(
      'UPDATE produtos SET imagem = ? WHERE id = ?',
      [imagem, id]
    );
    
    res.json({ 
      success: true, 
      message: 'Imagem atualizada com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao atualizar imagem:', error);
    res.status(500).json({ error: 'Erro ao atualizar imagem' });
  }
});

// Endpoint para upload de imagem
app.post('/api/produtos/:id/upload', upload.single('imagem'), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
    }
    
    // Caminho relativo para servir a imagem
    const imagePath = `/uploads/${req.file.filename}`;
    
    // Atualizar produto com o caminho da imagem
    await db.run(
      'UPDATE produtos SET imagem = ? WHERE id = ?',
      [imagePath, id]
    );
    
    res.json({ 
      success: true, 
      imagePath: imagePath,
      message: 'Imagem atualizada com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
  }
});

// Inicialização do banco e servidor
async function startServer() {
  try {
    db = await open({
      filename: path.join(__dirname, 'db.sqlite'),
      driver: sqlite3.Database
    });
    
    // Criar tabelas
    await db.run(`CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      descricao TEXT,
      preco REAL,
      imagem TEXT,
      categoria TEXT
    )`);
    
    await db.run(`CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_nome TEXT,
      cliente_telefone TEXT,
      cliente_endereco TEXT,
      forma_pagamento TEXT,
      total REAL,
      data DATETIME
    )`);
    
    await db.run(`CREATE TABLE IF NOT EXISTS pedido_itens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id INTEGER,
      produto_id INTEGER,
      quantidade INTEGER,
      preco_unitario REAL
    )`);
    
    // Verificar se há produtos, se não houver, popular o banco
    const produtosExistentes = await db.get('SELECT COUNT(*) as count FROM produtos');
    if (produtosExistentes.count === 0) {
      await popularBancoDeDados();
    }
    
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
  }
}

// Função para popular o banco de dados com o cardápio completo
async function popularBancoDeDados() {
  try {
    // Ler o arquivo cardapio.json
    const cardapioPath = path.join(__dirname, '../cardapio.json');
    const cardapioData = fs.readFileSync(cardapioPath, 'utf8');
    const cardapio = JSON.parse(cardapioData);
    
    // Inserir produtos por categoria
    for (const categoria of cardapio.categorias) {
      for (const item of categoria.itens) {
        await db.run(
          'INSERT INTO produtos (nome, descricao, preco, categoria) VALUES (?, ?, ?, ?)',
          [item.nome, item.descricao || '', item.preco, categoria.nome]
        );
      }
    }
    
    console.log('Banco de dados populado com sucesso!');
  } catch (error) {
    console.error('Erro ao popular o banco de dados:', error);
  }
}

startServer();