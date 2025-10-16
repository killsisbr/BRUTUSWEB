// Estado da aplicação
let produtos = [];
let produtoEditando = null;

// Elementos do DOM
const elements = {
  productsList: document.getElementById('products-list'),
  imageModal: document.getElementById('image-modal'),
  editProductImage: document.getElementById('edit-product-image'),
  editProductName: document.getElementById('edit-product-name'),
  editProductPrice: document.getElementById('edit-product-price'),
  imageUrl: document.getElementById('image-url'),
  saveImageBtn: document.getElementById('save-image-btn'),
  closeButtons: document.querySelectorAll('.close-button')
};

// Função para carregar produtos
async function carregarProdutos() {
  try {
    const res = await fetch('/api/produtos');
    produtos = await res.json();
    renderizarProdutos();
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
  }
}

// Renderizar produtos
function renderizarProdutos() {
  elements.productsList.innerHTML = '';
  
  produtos.forEach(produto => {
    const productCard = document.createElement('div');
    productCard.className = 'admin-product-card';
    productCard.innerHTML = `
      <img src="${produto.imagem || 'https://via.placeholder.com/80x80'}" 
           alt="${produto.nome}" 
           class="admin-product-image" 
           onerror="this.src='https://via.placeholder.com/80x80'">
      <div class="admin-product-info">
        <h3>${produto.nome}</h3>
        <p class="admin-product-category">${produto.categoria}</p>
        <p class="admin-product-price">R$ ${produto.preco.toFixed(2).replace('.', ',')}</p>
      </div>
      <button class="edit-image-btn" data-id="${produto.id}">
        <i class="fas fa-edit"></i> Editar Imagem
      </button>
    `;
    elements.productsList.appendChild(productCard);
  });
  
  // Adicionar eventos aos botões de editar imagem
  document.querySelectorAll('.edit-image-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const produtoId = parseInt(e.target.closest('.edit-image-btn').dataset.id);
      const produto = produtos.find(p => p.id === produtoId);
      if (produto) {
        mostrarModalEdicao(produto);
      }
    });
  });
}

// Mostrar modal de edição
function mostrarModalEdicao(produto) {
  produtoEditando = produto;
  
  elements.editProductImage.src = produto.imagem || 'https://via.placeholder.com/80x80';
  elements.editProductImage.alt = produto.nome;
  elements.editProductName.textContent = produto.nome;
  elements.editProductPrice.textContent = `R$ ${produto.preco.toFixed(2).replace('.', ',')}`;
  elements.imageUrl.value = produto.imagem || '';
  
  mostrarModal(elements.imageModal);
}

// Salvar imagem
async function salvarImagem() {
  if (!produtoEditando) return;
  
  const imageUrl = elements.imageUrl.value.trim();
  
  if (!imageUrl) {
    alert('Por favor, insira uma URL de imagem válida.');
    return;
  }
  
  try {
    const response = await fetch(`/api/produtos/${produtoEditando.id}/imagem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imagem: imageUrl })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Atualizar produto na lista
      const index = produtos.findIndex(p => p.id === produtoEditando.id);
      if (index !== -1) {
        produtos[index].imagem = imageUrl;
      }
      
      // Fechar modal
      fecharModal(elements.imageModal);
      
      // Recarregar produtos
      carregarProdutos();
      
      alert('Imagem atualizada com sucesso!');
    } else {
      alert('Erro ao atualizar imagem: ' + result.error);
    }
  } catch (error) {
    console.error('Erro ao salvar imagem:', error);
    alert('Erro ao salvar imagem. Por favor, tente novamente.');
  }
}

// Mostrar modal
function mostrarModal(modal) {
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

// Fechar modal
function fecharModal(modal) {
  modal.classList.remove('show');
  document.body.style.overflow = 'auto';
}

// Event Listeners
elements.saveImageBtn.addEventListener('click', salvarImagem);

// Fechar modais com botão X
elements.closeButtons.forEach(button => {
  button.addEventListener('click', () => {
    const modal = button.closest('.modal');
    fecharModal(modal);
  });
});

// Fechar modais ao clicar fora
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      fecharModal(modal);
    }
  });
});

// Inicializar a aplicação
document.addEventListener('DOMContentLoaded', () => {
  carregarProdutos();
});