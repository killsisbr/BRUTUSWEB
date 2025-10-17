# BrutusWeb - Sistema de Pedidos para Restaurantes

![BrutusWeb](https://via.placeholder.com/800x400/27ae60/ffffff?text=Brutus+Burger)

Sistema completo de pedidos online para restaurantes, desenvolvido com Node.js, Express e SQLite3. Permite aos clientes navegar pelo cardápio, selecionar produtos, adicionar ao carrinho e finalizar pedidos de forma intuitiva.

## 🚀 Tecnologias Utilizadas

- **Backend**: Node.js com Express.js
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Banco de Dados**: SQLite3
- **Integração WhatsApp**: whatsapp-web.js
- **Design**: Mobile-first, responsivo

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado em sua máquina:

- Node.js (versão 14 ou superior)
- npm (geralmente vem com o Node.js)
- Git (opcional, para clonar o repositório)

## 📦 Instalação

### Método 1: Instalação Manual

1. **Clone o repositório** (ou copie os arquivos):
   ```bash
   git clone <seu-repositorio> brutusweb
   cd brutusweb
   ```

2. **Instale as dependências do backend**:
   ```bash
   cd server
   npm install
   ```

3. **Popule o banco de dados**:
   ```bash
   node popular_db.js
   ```

4. **Inicie o servidor**:
   ```bash
   npm start
   ```

5. **Acesse a aplicação**:
   Abra seu navegador e acesse `http://localhost:3005`

### Método 2: Instalação em VPS (Automatizada)

1. **Dê permissão de execução ao script**:
   ```bash
   chmod +x setup.sh
   ```

2. **Execute o script como root**:
   ```bash
   sudo ./setup.sh
   ```

3. **O script irá**:
   - Instalar todas as dependências do sistema
   - Configurar o Node.js
   - Criar um usuário dedicado para a aplicação
   - Instalar as dependências do projeto
   - Popular o banco de dados
   - Configurar o serviço systemd
   - (Opcional) Instalar e configurar Nginx como proxy reverso

## 🛠️ Estrutura do Projeto

```
brutusweb/
├── public/                 # Frontend da aplicação
│   ├── index.html         # Página principal (carrossel de produtos)
│   ├── pedido.html        # Interface de pedidos via WhatsApp
│   ├── admin.html         # Painel administrativo
│   ├── script.js          # Lógica do frontend principal
│   ├── pedido-script.js   # Lógica específica para pedidos via WhatsApp
│   ├── admin.js           # Lógica administrativa
│   └── style.css          # Estilos da aplicação
├── server/                # Backend da aplicação
│   ├── server.js          # Servidor principal
│   ├── whatsapp-service.js # Integração com WhatsApp
│   ├── popular_db.js      # Script para popular o banco de dados
│   ├── package.json       # Dependências do projeto
│   └── db.sqlite          # Banco de dados SQLite
├── cardapio.json          # Cardápio completo do restaurante
├── setup.sh               # Script de instalação automatizada
└── README.md              # Este arquivo
```

## ⚙️ Configuração

### Variáveis de Ambiente

O sistema pode ser configurado através de variáveis de ambiente:

- `PORT`: Porta do servidor (padrão: 3005)
- `NODE_ENV`: Ambiente (development/production)

Exemplo de uso:
```bash
PORT=8080 npm start
```

### Personalização do Cardápio

Para adicionar ou editar produtos:

1. Edite o arquivo `cardapio.json`
2. Execute novamente o script de população:
   ```bash
   cd server
   node popular_db.js
   ```

## 📱 Funcionalidades

- **Navegação por categorias**: Lanches, Bebidas, Porções
- **Carrossel de produtos**: Interface intuitiva para visualização de itens
- **Sistema de adicionais**: Adicione queijo, bacon, catupiry, etc.
- **Carrinho de compras**: Adicione, remova e edite quantidades
- **Integração com WhatsApp**: Receba pedidos diretamente no WhatsApp
- **Painel administrativo**: Gerencie produtos e imagens
- **Design responsivo**: Otimizado para dispositivos móveis

## 🔧 Comandos Úteis

```bash
# Iniciar o servidor em modo de desenvolvimento
cd server
npm start

# Popular o banco de dados (apaga dados existentes)
cd server
node popular_db.js

# Verificar status do serviço (em VPS)
sudo systemctl status brutusweb

# Ver logs do serviço
sudo journalctl -u brutusweb -f
```

## 🚀 Deploy em Produção

### Com Nginx (Recomendado)

O script de setup já configura o Nginx como proxy reverso. Para configurar um domínio:

1. Edite o arquivo `/etc/nginx/sites-available/brutusweb`
2. Substitua `seu-dominio.com` pelo seu domínio real
3. Reinicie o Nginx:
   ```bash
   sudo systemctl restart nginx
   ```

### Com SSL (Let's Encrypt)

Para adicionar HTTPS:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

## 📊 Banco de Dados

O sistema utiliza SQLite3 para armazenamento de dados:

- **Produtos**: Informações do cardápio
- **Pedidos**: Histórico de pedidos realizados
- **Clientes**: Dados de clientes salvos via WhatsApp

Para acessar o banco de dados diretamente:
```bash
sqlite3 server/db.sqlite
```

## 🤝 Integração com WhatsApp

O sistema inclui integração com WhatsApp Web para atendimento automatizado:

1. Ao iniciar o servidor, será exibido um QR Code no terminal
2. Escaneie o QR Code com o WhatsApp do seu celular
3. O sistema estará pronto para receber comandos via WhatsApp

Comandos disponíveis:
- `oi` ou `olá`: Mensagem de boas-vindas
- `pedido`: Link para criar pedido
- `ajuda`: Lista de comandos disponíveis

## 🛡️ Segurança

- O script de setup cria um usuário dedicado para a aplicação
- Permissões restritas para arquivos sensíveis
- Configuração de firewall básica

## 📈 Melhorias Planejadas

Consulte o arquivo [melhoria.md](melhoria.md) para ver as melhorias planejadas para o sistema.

## 📞 Suporte

Para suporte, entre em contato com:
- Email: [seu-email@dominio.com]
- WhatsApp: [(XX) X XXXX-XXXX]

## 📄 Licença

Este projeto é licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- Desenvolvido para facilitar pedidos em restaurantes de forma simples e visual
- Contribuições são bem-vindas!

---