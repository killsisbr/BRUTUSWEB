// Estado da aplicação
let produtos = [];
let produtoEditando = null;
let produtoParaExcluir = null;
let isDragging = false;
let dragStartX, dragStartY;
let imageStartX = 0, imageStartY = 0;
let currentImageX = 0, currentImageY = 0;
let currentZoom = 1;

// Elementos do DOM
const elements = {
  productsList: document.getElementById('products-list'),
  imageModal: document.getElementById('edit-modal'),
  deleteModal: document.getElementById('delete-modal'),
  editProductImage: document.getElementById('edit-product-image'),
  editProductNameDisplay: document.getElementById('edit-product-name-display'),
  editProductPriceDisplay: document.getElementById('edit-product-price-display'),
  editProductName: document.getElementById('edit-product-name'),
  editProductDescription: document.getElementById('edit-product-description'),
  editProductPrice: document.getElementById('edit-product-price'),
  editProductCategory: document.getElementById('edit-product-category'),
  imageUrl: document.getElementById('image-url'),
  imageFile: document.getElementById('image-file'),
  saveUrlBtn: document.getElementById('save-url-btn'),
  uploadImageBtn: document.getElementById('upload-image-btn'),
  saveProductBtn: document.getElementById('save-product-btn'),
  closeButtons: document.querySelectorAll('.close-button'),
  deleteProductName: document.getElementById('delete-product-name'),
  cancelDeleteBtn: document.getElementById('cancel-delete-btn'),
  confirmDeleteBtn: document.getElementById('confirm-delete-btn'),
  // Elementos de zoom
  zoomInBtn: document.getElementById('zoom-in-btn'),
  zoomOutBtn: document.getElementById('zoom-out-btn'),
  resetZoomBtn: document.getElementById('reset-zoom-btn'),
  // Elementos das abas
  tabUpload: document.getElementById('tab-upload'),
  tabUrl: document.getElementById('tab-url'),
  uploadContent: document.getElementById('upload-content'),
  urlContent: document.getElementById('url-content')
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
        <p class="admin-product-description">${produto.descricao || 'Sem descrição'}</p>
        <p class="admin-product-price">R$ ${produto.preco.toFixed(2).replace('.', ',')}</p>
      </div>
      <div class="admin-product-actions">
        <button class="edit-image-btn" data-id="${produto.id}">
          <i class="fas fa-edit"></i> Editar
        </button>
        <button class="delete-product-btn" data-id="${produto.id}" data-name="${produto.nome}">
          <i class="fas fa-trash"></i> Excluir
        </button>
      </div>
    `;
    elements.productsList.appendChild(productCard);
  });
  
  // Adicionar eventos aos botões de editar
  document.querySelectorAll('.edit-image-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const produtoId = parseInt(e.target.closest('.edit-image-btn').dataset.id);
      const produto = produtos.find(p => p.id === produtoId);
      if (produto) {
        mostrarModalEdicao(produto);
      }
    });
  });
  
  // Adicionar eventos aos botões de excluir
  document.querySelectorAll('.delete-product-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const produtoId = parseInt(e.target.closest('.delete-product-btn').dataset.id);
      const produtoNome = e.target.closest('.delete-product-btn').dataset.name;
      const produto = produtos.find(p => p.id === produtoId);
      if (produto) {
        mostrarModalExclusao(produto);
      }
    });
  });
}

// Mostrar modal de edição
function mostrarModalEdicao(produto) {
  produtoEditando = produto;
  
  // Resetar estado da imagem
  resetarImagem();
  
  // Atualizar imagem e informações do produto
  elements.editProductImage.src = produto.imagem || 'https://via.placeholder.com/80x80';
  elements.editProductImage.alt = produto.nome;
  elements.editProductNameDisplay.textContent = produto.nome;
  elements.editProductPriceDisplay.textContent = `R$ ${produto.preco.toFixed(2).replace('.', ',')}`;
  
  // Preencher campos do formulário
  elements.editProductName.value = produto.nome;
  elements.editProductDescription.value = produto.descricao || '';
  elements.editProductPrice.value = produto.preco;
  elements.editProductCategory.value = produto.categoria;
  elements.imageUrl.value = produto.imagem || '';
  elements.imageFile.value = '';
  
  // Mostrar aba de upload por padrão
  mostrarAba('upload');
  
  // Adicionar eventos de drag and drop
  adicionarEventosDrag();
  
  mostrarModal(elements.imageModal);
}

// Resetar estado da imagem
function resetarImagem() {
  isDragging = false;
  currentImageX = 0;
  currentImageY = 0;
  currentZoom = 1;
  if (elements.editProductImage) {
    elements.editProductImage.style.transform = 'translate(0px, 0px) scale(1)';
  }
}

// Adicionar eventos de drag and drop
function adicionarEventosDrag() {
  if (!elements.editProductImage) return;
  
  // Evento de mouse down (início do arrasto)
  elements.editProductImage.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return; // Apenas botão esquerdo do mouse
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    imageStartX = currentImageX;
    imageStartY = currentImageY;
    elements.editProductImage.style.cursor = 'grabbing';
    e.preventDefault();
  });
  
  // Evento de mouse move (durante o arrasto)
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;
    
    currentImageX = imageStartX + deltaX;
    currentImageY = imageStartY + deltaY;
    
    elements.editProductImage.style.transform = `translate(${currentImageX}px, ${currentImageY}px) scale(${currentZoom})`;
  });
  
  // Evento de mouse up (fim do arrasto)
  document.addEventListener('mouseup', () => {
    isDragging = false;
    if (elements.editProductImage) {
      elements.editProductImage.style.cursor = 'grab';
    }
  });
  
  // Definir cursor inicial
  elements.editProductImage.style.cursor = 'grab';
}

// Funções de zoom
function aplicarZoom() {
  if (elements.editProductImage) {
    elements.editProductImage.style.transform = `translate(${currentImageX}px, ${currentImageY}px) scale(${currentZoom})`;
  }
}

function zoomIn() {
  currentZoom = Math.min(currentZoom + 0.1, 3); // Limite máximo de 3x
  aplicarZoom();
}

function zoomOut() {
  currentZoom = Math.max(currentZoom - 0.1, 0.5); // Limite mínimo de 0.5x
  aplicarZoom();
}

function resetarZoom() {
  currentZoom = 1;
  aplicarZoom();
}

// Mostrar modal de exclusão
function mostrarModalExclusao(produto) {
  produtoParaExcluir = produto;
  
  elements.deleteProductName.textContent = produto.nome;
  
  mostrarModal(elements.deleteModal);
}

// Mostrar aba
function mostrarAba(aba) {
  // Atualizar botões das abas
  elements.tabUpload.classList.toggle('active', aba === 'upload');
  elements.tabUrl.classList.toggle('active', aba === 'url');
  
  // Mostrar conteúdo da aba selecionada
  elements.uploadContent.classList.toggle('active', aba === 'upload');
  elements.urlContent.classList.toggle('active', aba === 'url');
}

// Salvar dados do produto
async function salvarProduto() {
  if (!produtoEditando) return;
  
  const nome = elements.editProductName.value.trim();
  const descricao = elements.editProductDescription.value.trim();
  const preco = parseFloat(elements.editProductPrice.value);
  const categoria = elements.editProductCategory.value.trim();
  
  if (!nome || isNaN(preco) || preco < 0 || !categoria) {
    alert('Por favor, preencha todos os campos obrigatórios corretamente.');
    return;
  }
  
  try {
    const response = await fetch(`/api/produtos/${produtoEditando.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome, descricao, preco, categoria })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Atualizar produto na lista
      const index = produtos.findIndex(p => p.id === produtoEditando.id);
      if (index !== -1) {
        produtos[index] = { ...produtos[index], nome, descricao, preco, categoria };
      }
      
      // Atualizar informações no modal
      elements.editProductNameDisplay.textContent = nome;
      elements.editProductPriceDisplay.textContent = `R$ ${preco.toFixed(2).replace('.', ',')}`;
      
      // Fechar modal
      fecharModal(elements.imageModal);
      
      // Recarregar produtos
      carregarProdutos();
      
      alert('Produto atualizado com sucesso!');
    } else {
      alert('Erro ao atualizar produto: ' + result.error);
    }
  } catch (error) {
    console.error('Erro ao salvar produto:', error);
    alert('Erro ao salvar produto. Por favor, tente novamente.');
  }
}

// Excluir produto
async function excluirProduto() {
  if (!produtoParaExcluir) return;
  
  try {
    const response = await fetch(`/api/produtos/${produtoParaExcluir.id}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Fechar modal
      fecharModal(elements.deleteModal);
      
      // Recarregar produtos
      carregarProdutos();
      
      alert('Produto excluído com sucesso!');
    } else {
      alert('Erro ao excluir produto: ' + result.error);
    }
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    alert('Erro ao excluir produto. Por favor, tente novamente.');
  }
}

// Salvar imagem via URL
async function salvarImagemUrl() {
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
      
      // Atualizar imagem no modal
      elements.editProductImage.src = imageUrl;
      
      // Resetar posição e zoom
      resetarImagem();
      
      alert('Imagem atualizada com sucesso!');
    } else {
      alert('Erro ao atualizar imagem: ' + result.error);
    }
  } catch (error) {
    console.error('Erro ao salvar imagem:', error);
    alert('Erro ao salvar imagem. Por favor, tente novamente.');
  }
}

// Fazer upload de imagem
async function fazerUploadImagem() {
  if (!produtoEditando) return;
  
  const file = elements.imageFile.files[0];
  
  if (!file) {
    alert('Por favor, selecione uma imagem para fazer upload.');
    return;
  }
  
  // Verificar se é uma imagem
  if (!file.type.startsWith('image/')) {
    alert('Por favor, selecione um arquivo de imagem válido.');
    return;
  }
  
  // Verificar tamanho (máximo 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('A imagem deve ter no máximo 5MB.');
    return;
  }
  
  try {
    const formData = new FormData();
    formData.append('imagem', file);
    
    const response = await fetch(`/api/produtos/${produtoEditando.id}/upload`, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Atualizar produto na lista
      const index = produtos.findIndex(p => p.id === produtoEditando.id);
      if (index !== -1) {
        produtos[index].imagem = result.imagePath;
      }
      
      // Atualizar imagem no modal
      elements.editProductImage.src = result.imagePath;
      
      // Resetar posição e zoom
      resetarImagem();
      
      alert('Imagem atualizada com sucesso!');
    } else {
      alert('Erro ao fazer upload da imagem: ' + result.error);
    }
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    alert('Erro ao fazer upload da imagem. Por favor, tente novamente.');
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
elements.saveUrlBtn.addEventListener('click', salvarImagemUrl);
elements.uploadImageBtn.addEventListener('click', fazerUploadImagem);
elements.saveProductBtn.addEventListener('click', salvarProduto);
elements.confirmDeleteBtn.addEventListener('click', excluirProduto);
elements.cancelDeleteBtn.addEventListener('click', () => fecharModal(elements.deleteModal));

// Event Listeners para zoom
elements.zoomInBtn.addEventListener('click', zoomIn);
elements.zoomOutBtn.addEventListener('click', zoomOut);
elements.resetZoomBtn.addEventListener('click', resetarZoom);

// Event Listeners para as abas
elements.tabUpload.addEventListener('click', () => mostrarAba('upload'));
elements.tabUrl.addEventListener('click', () => mostrarAba('url'));

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