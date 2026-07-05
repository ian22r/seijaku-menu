/* ==========================================================================
   CARRITO SEIJAKU — Lógica completa optimizada
   ========================================================================== */

const WHATSAPP_NUMBER = "5217721540533";
let cart = [];

// Referencias DOM
const cartFloatingBtn = document.getElementById('cart-floating-btn');
const cartCountBadge  = document.getElementById('cart-count-badge');
const cartModal       = document.getElementById('cart-modal');
const closeModalBtn   = document.getElementById('close-modal-btn');
const cartItemsList   = document.getElementById('cart-items-list');
const cartTotalPrice  = document.getElementById('cart-total-price');
const checkoutForm    = document.getElementById('checkout-form');
const customRollBtn   = document.getElementById('add-custom-roll-btn');
const calpisSelect    = document.getElementById('calpis-flavor');
const calpisBtn       = document.getElementById('calpis-btn');

/* ------------------------------------------------------------------
   ROLLO PERSONALIZADO — Validación y construcción del nombre
------------------------------------------------------------------ */
function validateSection(checkbox, groupSelector) {
    const checked = document.querySelectorAll(`${groupSelector} input[type="checkbox"]:checked`);
    if (checked.length > 3) {
        checkbox.checked = false;
        alert("Solo puedes seleccionar un máximo de 3 ingredientes por sección.");
        return;
    }
    updateCustomRollData();
}

function updateCustomRollData() {
    const get = (sel) =>
        Array.from(document.querySelectorAll(`${sel} input[type="checkbox"]:checked`))
             .map(cb => cb.value).join(', ') || null;

    const covers   = get('#cover-checkbox-group');
    const fillings = get('#fillings-checkbox-group');
    const sauces   = get('#sauces-checkbox-group');

    const fullName = covers || fillings || sauces
        ? `Rollo Personalizado (Fuera: \${covers ?? 'Ninguna'} | Dentro: \${fillings ?? 'Ninguno'} | Salsas: \${sauces ?? 'Ninguno'})`
        : 'Rollo Personalizado (Por armar)';

    customRollBtn.setAttribute('data-name', fullName);
}

// Exponer para los onchange del HTML
window.validateSection      = validateSection;
window.updateCustomRollData = updateCustomRollData;

/* ------------------------------------------------------------------
   CALPIS — Sincronizar sabor con el botón
------------------------------------------------------------------ */
calpisSelect.addEventListener('change', () => {
    calpisBtn.setAttribute('data-name', `Calpis de la Casa (${calpisSelect.value})`);
});

/* ------------------------------------------------------------------
   AÑADIR AL CARRITO
------------------------------------------------------------------ */
function addToCart(name, price) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    updateCartUI();
}

function feedbackButton(btn, originalText) {
    btn.textContent = '¡Añadido! ✓';
    btn.disabled = true;
    setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
    }, 1200);
}

document.querySelectorAll('.add-to-cart, .add-to-cart-variant').forEach(btn => {
    btn.addEventListener('click', () => {

        // Rollo personalizado
        if (btn.id === 'add-custom-roll-btn') {
            const name = btn.getAttribute('data-name');
            if (name === 'Rollo Personalizado (Por armar)') {
                alert("Por favor, selecciona al menos un ingrediente para armar tu rollo personalizado.");
                return;
            }
            addToCart(name, parseInt(btn.getAttribute('data-price')));
            document.querySelectorAll('.custom-roll-block input[type="checkbox"]').forEach(cb => cb.checked = false);
            updateCustomRollData();
            feedbackButton(btn, 'Añadir al carrito');
            return;
        }

        // Productos normales
        const name  = btn.getAttribute('data-name');
        const price = parseInt(btn.getAttribute('data-price'));
        addToCart(name, price);
        feedbackButton(btn, btn.textContent);
    });
});

/* ------------------------------------------------------------------
   ACTUALIZAR UI
------------------------------------------------------------------ */
function updateCartUI() {
    const total = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCountBadge.textContent = total;

    if (total > 0) {
        cartFloatingBtn.classList.remove('hidden');
    } else {
        cartFloatingBtn.classList.add('hidden');
        cartModal.classList.add('hidden');
    }
}

/* ------------------------------------------------------------------
   RENDERIZAR MODAL — Sin innerHTML para evitar bugs de interpolación
------------------------------------------------------------------ */
function renderCartModal() {
    cartItemsList.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        const row = document.createElement('div');
        row.className = 'cart-item-row';

        // Columna izquierda: cantidad, nombre y precio unitario
        const left = document.createElement('div');
        left.innerHTML = `<strong>${item.quantity}x</strong> \${item.name} <span style="color:#7b8580; margin-left:5px;">($${item.price})</span>`;

        // Columna derecha: subtotal + botón eliminar
        const right = document.createElement('div');

        const subtotalSpan = document.createElement('span');
        subtotalSpan.textContent = `$${subtotal}`;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-item';
        removeBtn.innerHTML = '<i class="far fa-trash-alt"></i>';
        removeBtn.addEventListener('click', () => {
            cart.splice(index, 1);
            updateCartUI();
            if (cart.length > 0) {
                renderCartModal();
            }
        });

        right.appendChild(subtotalSpan);
        right.appendChild(removeBtn);
        row.appendChild(left);
        row.appendChild(right);
        cartItemsList.appendChild(row);
    });

    cartTotalPrice.textContent = `$${total}`;
}

/* ------------------------------------------------------------------
   ABRIR / CERRAR MODAL
------------------------------------------------------------------ */
cartFloatingBtn.addEventListener('click', () => {
    renderCartModal();
    cartModal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => cartModal.classList.add('hidden'));

// Cerrar al hacer clic fuera del contenido
cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) cartModal.classList.add('hidden');
});

/* ------------------------------------------------------------------
   ENVÍO POR WHATSAPP
------------------------------------------------------------------ */
checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name    = document.getElementById('client-name').value.trim();
    const phone   = document.getElementById('client-phone').value.trim();
    const address = document.getElementById('client-address').value.trim();

    let total = 0;
    let message = `*✨ NUEVO PEDIDO — SEIJAKU ✨*\n\n`;
    message += `*👤 Cliente:* \${name}\n`;
    message += `*📞 Teléfono:* \${phone}\n`;
    message += `*📍 Dirección:* \${address}\n\n`;
    message += `*📋 Detalle del Pedido:*\n`;

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        message += `• \${item.quantity}x \${item.name} — \$${subtotal}\n`;
    });

    message += `\n*💰 Total Estimado:* \$${total}\n`;
    message += `\n_El pedido se confirmará respondiendo a este mensaje._`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');

    cart = [];
    updateCartUI();
    checkoutForm.reset();
});
