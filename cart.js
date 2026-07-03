// Configuración inicial del carrito vacio
let cart = [];
const WHATSAPP_NUMBER = "5217721540533"; // Tu número de Seijaku

// Elementos del DOM actualizados
const cartFloatingBtn = document.getElementById('cart-floating-btn');
const cartCountBadge = document.getElementById('cart-count-badge');
const cartModal = document.getElementById('cart-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const cartItemsList = document.getElementById('cart-items-list');
const cartTotalPrice = document.getElementById('cart-total-price');
const checkoutForm = document.getElementById('checkout-form');

// Escuchas para añadir elementos (General y Variantes)
document.querySelectorAll('.add-to-cart, .add-to-cart-variant').forEach(button => {
    button.addEventListener('click', (e) => {
        const name = button.getAttribute('data-name');
        const price = parseInt(button.getAttribute('data-price'));
        
        addToCart(name, price);
    });
});

// Función para añadir al arreglo del carrito
function addToCart(name, price) {
    // Validar si el elemento ya existe para sumar cantidad
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    updateCartUI();
}

// Actualizar el nuevo botón flotante circular e indicadores en la pantalla
function updateCartUI() {
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    
    if (totalItems > 0) {
        cartCountBadge.innerText = totalItems;
        cartFloatingBtn.classList.remove('hidden');
    } else {
        cartFloatingBtn.classList.add('hidden');
        cartModal.classList.add('hidden');
    }
}

// Función centralizada para armar y renderizar la lista del modal
function renderCartModal() {
    cartItemsList.innerHTML = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemSubtotal = item.price * item.quantity;
        total += itemSubtotal;
        
        const row = document.createElement('div');
        row.className = 'cart-item-row';
        row.innerHTML = `
            <div>
                <strong>${item.quantity}x</strong> ${item.name} 
                <span style="color: #7b8580; margin-left: 5px;">($${item.price})</span>
            </div>
            <div>
                <span>$${itemSubtotal}</span>
                <button class="remove-item" onclick="removeItemFromCart(${index})"><i class="far fa-trash-alt"></i></button>
            </div>
        `;
        cartItemsList.appendChild(row);
    });
    
    cartTotalPrice.innerText = `$${total}`;
}

// Abrir el modal elegante al pulsar el botón circular flotante
cartFloatingBtn.addEventListener('click', () => {
    renderCartModal();
    cartModal.classList.remove('hidden');
});

// Remover elementos individualmente dentro del modal
window.removeItemFromCart = function(index) {
    cart.splice(index, 1);
    updateCartUI();
    if (cart.length > 0) {
        renderCartModal(); // Refresca visualmente la lista interna si aún quedan productos
    }
};

// Cerrar Modal
closeModalBtn.addEventListener('click', () => cartModal.classList.add('hidden'));

// Procesar Formulario y despachar mensaje automatizado a WhatsApp
checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('client-name').value.trim();
    const phone = document.getElementById('client-phone').value.trim();
    const address = document.getElementById('client-address').value.trim();
    
    let total = 0;
    
    // Formateo del mensaje con estilo limpio e inteligible
    let message = `*✨ NUEVO PEDIDO — SEIJAKU ✨*\n\n`;
    message += `*👤 Cliente:* ${name}\n`;
    message += `*📞 Teléfono:* ${phone}\n`;
    message += `*📍 Dirección:* ${address}\n\n`;
    message += `*📋 Detalle del Pedido:*\n`;
    
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        message += `• ${item.quantity}x ${item.name} — $${subtotal}\n`;
    });
    
    message += `\n*💰 Total Estimado:* $${total}\n`;
    message += `\n_El pedido se confirmará respondiendo a este mensaje._`;
    
    // Codificación segura para URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    // Limpiar carrito tras redirigir
    cart = [];
    updateCartUI();
    checkoutForm.reset();
    
    // Redirección al cliente
    window.open(whatsappUrl, '_blank');
});