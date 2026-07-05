/* ==========================================================================
   CARRITO SEIJAKU v2.0
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
   ROLLO PERSONALIZADO
------------------------------------------------------------------ */
function validateSection(checkbox, groupSelector) {
    const checked = document.querySelectorAll(groupSelector + ' input[type="checkbox"]:checked');
    if (checked.length > 3) {
        checkbox.checked = false;
        alert("Solo puedes seleccionar un máximo de 3 ingredientes por sección.");
        return;
    }
    updateCustomRollData();
}

function updateCustomRollData() {
    function getValues(sel) {
        var boxes = document.querySelectorAll(sel + ' input[type="checkbox"]:checked');
        var vals = [];
        boxes.forEach(function(cb) { vals.push(cb.value); });
        return vals.length > 0 ? vals.join(', ') : null;
    }

    var covers   = getValues('#cover-checkbox-group');
    var fillings = getValues('#fillings-checkbox-group');
    var sauces   = getValues('#sauces-checkbox-group');

    var fullName;
    if (covers || fillings || sauces) {
        fullName = 'Rollo Personalizado (Fuera: ' + (covers || 'Ninguna') +
                   ' | Dentro: ' + (fillings || 'Ninguno') +
                   ' | Salsas: ' + (sauces || 'Ninguno') + ')';
    } else {
        fullName = 'Rollo Personalizado (Por armar)';
    }

    customRollBtn.setAttribute('data-name', fullName);
}

window.validateSection      = validateSection;
window.updateCustomRollData = updateCustomRollData;

/* ------------------------------------------------------------------
   CALPIS — Sincronizar sabor
------------------------------------------------------------------ */
calpisSelect.addEventListener('change', function() {
    calpisBtn.setAttribute('data-name', 'Calpis de la Casa (' + calpisSelect.value + ')');
});

/* ------------------------------------------------------------------
   AÑADIR AL CARRITO
------------------------------------------------------------------ */
function addToCart(name, price) {
    var existing = null;
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].name === name) { existing = cart[i]; break; }
    }
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ name: name, price: price, quantity: 1 });
    }
    updateCartUI();
}

function feedbackButton(btn, originalText) {
    btn.textContent = '¡Añadido! ✓';
    btn.disabled = true;
    setTimeout(function() {
        btn.textContent = originalText;
        btn.disabled = false;
    }, 1200);
}

document.querySelectorAll('.add-to-cart, .add-to-cart-variant').forEach(function(btn) {
    btn.addEventListener('click', function() {

        // Rollo personalizado
        if (btn.id === 'add-custom-roll-btn') {
            var name = btn.getAttribute('data-name');
            if (name === 'Rollo Personalizado (Por armar)') {
                alert("Por favor, selecciona al menos un ingrediente para armar tu rollo personalizado.");
                return;
            }
            addToCart(name, parseInt(btn.getAttribute('data-price')));
            document.querySelectorAll('.custom-roll-block input[type="checkbox"]').forEach(function(cb) {
                cb.checked = false;
            });
            updateCustomRollData();
            feedbackButton(btn, 'Añadir al carrito');
            return;
        }

        // Productos normales
        var name  = btn.getAttribute('data-name');
        var price = parseInt(btn.getAttribute('data-price'));
        var originalText = btn.textContent;
        addToCart(name, price);
        feedbackButton(btn, originalText);
    });
});

/* ------------------------------------------------------------------
   ACTUALIZAR UI
------------------------------------------------------------------ */
function updateCartUI() {
    var total = 0;
    cart.forEach(function(item) { total += item.quantity; });
    cartCountBadge.textContent = total;

    if (total > 0) {
        cartFloatingBtn.classList.remove('hidden');
    } else {
        cartFloatingBtn.classList.add('hidden');
        cartModal.classList.add('hidden');
    }
}

/* ------------------------------------------------------------------
   RENDERIZAR MODAL — 100% createElement, sin template literals
------------------------------------------------------------------ */
function renderCartModal() {
    cartItemsList.innerHTML = '';
    var total = 0;

    cart.forEach(function(item, index) {
        var subtotal = item.price * item.quantity;
        total += subtotal;

        var row = document.createElement('div');
        row.className = 'cart-item-row';

        // Columna izquierda
        var left = document.createElement('div');

        var bold = document.createElement('strong');
        bold.textContent = item.quantity + 'x';

        var nameText = document.createTextNode(' ' + item.name + ' ');

        var priceSpan = document.createElement('span');
        priceSpan.style.color = '#7b8580';
        priceSpan.style.marginLeft = '5px';
        priceSpan.textContent = '($' + item.price + ')';

        left.appendChild(bold);
        left.appendChild(nameText);
        left.appendChild(priceSpan);

        // Columna derecha
        var right = document.createElement('div');

        var subtotalSpan = document.createElement('span');
        subtotalSpan.textContent = '$' + subtotal;

        var removeBtn = document.createElement('button');
        removeBtn.className = 'remove-item';
        var icon = document.createElement('i');
        icon.className = 'far fa-trash-alt';
        removeBtn.appendChild(icon);

        // Capturar index correctamente
        (function(i) {
            removeBtn.addEventListener('click', function() {
                cart.splice(i, 1);
                updateCartUI();
                if (cart.length > 0) {
                    renderCartModal();
                }
            });
        })(index);

        right.appendChild(subtotalSpan);
        right.appendChild(removeBtn);

        row.appendChild(left);
        row.appendChild(right);
        cartItemsList.appendChild(row);
    });

    cartTotalPrice.textContent = '$' + total;
}

/* ------------------------------------------------------------------
   ABRIR / CERRAR MODAL
------------------------------------------------------------------ */
cartFloatingBtn.addEventListener('click', function() {
    renderCartModal();
    cartModal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', function() {
    cartModal.classList.add('hidden');
});

cartModal.addEventListener('click', function(e) {
    if (e.target === cartModal) cartModal.classList.add('hidden');
});

/* ------------------------------------------------------------------
   ENVÍO POR WHATSAPP
------------------------------------------------------------------ */
checkoutForm.addEventListener('submit', function(e) {
    e.preventDefault();

    var name    = document.getElementById('client-name').value.trim();
    var phone   = document.getElementById('client-phone').value.trim();
    var address = document.getElementById('client-address').value.trim();

    var total = 0;
    var message = '*✨ NUEVO PEDIDO — SEIJAKU ✨*\n\n';
    message += '*👤 Cliente:* ' + name + '\n';
    message += '*📞 Teléfono:* ' + phone + '\n';
    message += '*📍 Dirección:* ' + address + '\n\n';
    message += '*📋 Detalle del Pedido:*\n';

    cart.forEach(function(item) {
        var subtotal = item.price * item.quantity;
        total += subtotal;
        message += '• ' + item.quantity + 'x ' + item.name + ' — \$' + subtotal + '\n';
    });

    message += '\n*💰 Total Estimado:* \$' + total + '\n';
    message += '\n_El pedido se confirmará respondiendo a este mensaje._';

    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message), '_blank');

    cart = [];
    updateCartUI();
    checkoutForm.reset();
});
