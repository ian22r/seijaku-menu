/* ==========================================================================
   CARRITO SEIJAKU v2.1 (CORREGIDO)
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
var checkboxGroups = [\n    { selector: '#cover-checkbox-group',    max: 3 },\n    { selector: '#fillings-checkbox-group', max: 3 },\n    { selector: '#sauces-checkbox-group',   max: 3 }\n];

checkboxGroups.forEach(function(group) {
    var boxes = document.querySelectorAll(group.selector + ' input[type="checkbox"]');
    boxes.forEach(function(checkbox) {
        checkbox.addEventListener('change', function() {
            var checkedCount = document.querySelectorAll(group.selector + ' input[type="checkbox"]:checked').length;
            if (checkedCount > group.max) {
                this.checked = false;
                alert('Solo puedes seleccionar un máximo de ' + group.max + ' ingredientes para esta sección.');
            }
            updateCustomRollData();
        });
    });
});

function updateCustomRollData() {
    var basePrice = 80;
    var extraPrice = 0;
    var selectedIngredients = [];

    var checkedBoxes = document.querySelectorAll('.custom-roll-block input[type="checkbox"]:checked');
    checkedBoxes.forEach(function(cb) {
        extraPrice += parseInt(cb.getAttribute('data-price')) || 0;
        selectedIngredients.push(cb.getAttribute('data-name'));
    });

    var finalPrice = basePrice + extraPrice;
    var summarySpan = document.getElementById('custom-roll-summary');
    var priceDisplay = document.getElementById('custom-roll-price-display');

    if (selectedIngredients.length > 0) {
        summarySpan.textContent = "Tu Rollo: " + selectedIngredients.join(', ');
    } else {
        summarySpan.textContent = "Rollo Personalizado (Por armar)";
    }

    priceDisplay.textContent = "$" + finalPrice;
    if (customRollBtn) {
        customRollBtn.setAttribute('data-price', finalPrice);
        customRollBtn.setAttribute('data-name', "Rollo Personalizado (" + selectedIngredients.join('/') + ")");
    }
}

/* ------------------------------------------------------------------
   MANEJO DINÁMICO DE VARIANTES (YAKIMESHI, KUSHIAGES, CALPIS)
------------------------------------------------------------------ */
// Eventos para selectores de variantes individuales (Corregido)
var yakimeshiSelect = document.getElementById('yakimeshi-variant');
if (yakimeshiSelect) {
    yakimeshiSelect.addEventListener('change', function() {
        var opt = this.options[this.selectedIndex];
        var addPrice = parseInt(opt.getAttribute('data-add-price')) || 0;
        var basePrice = parseInt(this.getAttribute('data-base-price')) || 85;
        var btn = document.getElementById('yakimeshi-btn');
        if (btn) {
            btn.setAttribute('data-price', basePrice + addPrice);
            btn.setAttribute('data-name', this.getAttribute('data-base-name') + " (" + this.value + ")");
        }
    });
}

var kushiageSelect = document.getElementById('kushiage-variant');
if (kushiageSelect) {
    kushiageSelect.addEventListener('change', function() {
        var opt = this.options[this.selectedIndex];
        var addPrice = parseInt(opt.getAttribute('data-add-price')) || 0;
        var basePrice = parseInt(this.getAttribute('data-base-price')) || 65;
        var btn = document.getElementById('kushiage-btn');
        if (btn) {
            btn.setAttribute('data-price', basePrice + addPrice);
            btn.setAttribute('data-name', this.getAttribute('data-base-name') + " (" + this.value + ")");
        }
    });
}

if (calpisSelect) {
    calpisSelect.addEventListener('change', function() {
        if (calpisBtn) {
            calpisBtn.setAttribute('data-name', this.getAttribute('data-base-name') + " (" + this.value + ")");
        }
    });
}

/* ------------------------------------------------------------------
   AÑADIR AL CARRITO (BOTONES GENERALES)
------------------------------------------------------------------ */
// Escucha global de clics para evitar fallos de carga en producción
document.addEventListener('click', function(e) {
    var btn = e.target.closest('.add-to-cart, .add-to-cart-variant');
    if (!btn) return;

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

    var name = btn.getAttribute('data-name');
    var price = parseInt(btn.getAttribute('data-price'));
    var originalText = btn.textContent;

    addToCart(name, price);
    feedbackButton(btn, originalText);
});

function addToCart(name, price) {
    cart.push({ name: name, price: price });
    updateCartUI();
}

function feedbackButton(btn, originalText) {
    btn.textContent = "¡Añadido!";
    btn.style.backgroundColor = "#095a35";
    btn.style.color = "#ffffff";
    btn.disabled = true;
    setTimeout(function() {
        btn.textContent = originalText;
        btn.style.backgroundColor = "";
        btn.style.color = "";
        btn.disabled = false;
    }, 800);
}

/* ------------------------------------------------------------------
   INTERFAZ DE USUARIO (UI)
------------------------------------------------------------------ */
function updateCartUI() {
    cartCountBadge.textContent = cart.length;
    if (cart.length > 0) {
        cartFloatingBtn.classList.remove('hidden');
    } else {
        cartFloatingBtn.classList.add('hidden');
        cartModal.classList.add('hidden');
    }
}

function renderCartModal() {
    cartItemsList.innerHTML = '';
    var total = 0;

    cart.forEach(function(item, index) {
        var subtotal = item.price;
        total += subtotal;

        var row = document.createElement('div');
        row.className = 'cart-item-row';
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        row.style.marginBottom = '15px';

        var left = document.createElement('div');
        var nameText = document.createElement('p');
        nameText.textContent = item.name;
        nameText.style.margin = '0';
        nameText.style.fontWeight = '500';
        var priceSpan = document.createElement('span');
        priceSpan.textContent = '$' + item.price;
        priceSpan.style.fontSize = '12px';
        priceSpan.style.color = '#666';
        left.appendChild(nameText);
        left.appendChild(priceSpan);

        var right = document.createElement('div');
        var subtotalSpan = document.createElement('span');
        subtotalSpan.textContent = '$' + subtotal;
        var removeBtn = document.createElement('button');
        removeBtn.className = 'remove-item';
        removeBtn.style.background = 'none';
        removeBtn.style.border = 'none';
        removeBtn.style.color = '#c0392b';
        removeBtn.style.marginLeft = '15px';
        removeBtn.style.cursor = 'pointer';
        var icon = document.createElement('i');
        icon.className = 'far fa-trash-alt';
        removeBtn.appendChild(icon);

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
   ENVÍO DE PEDIDO A WHATSAPP
------------------------------------------------------------------ */
checkoutForm.addEventListener('submit', function(e) {
    e.preventDefault();

    var clientName = document.getElementById('client-name').value;
    var clientPhone = document.getElementById('client-phone').value;
    var clientAddress = document.getElementById('client-address').value;

    var message = "*NUEVO PEDIDO - SEIJAKU*\n\n";
    message += "*Cliente:* " + clientName + "\n";
    message += "*Teléfono:* " + clientPhone + "\n";
    message += "*Dirección:* " + clientAddress + "\n\n";
    message += "--- *DETALLE DEL PEDIDO* ---\n";

    var total = 0;
    cart.forEach(function(item) {
        message += "• " + item.name + " - $" + item.price + "\n";
        total += item.price;
    });

    message += "\n*Total a Pagar:* $" + total + "\n\n";
    message += "_Pedido enviado automáticamente desde el menú digital._";

    var whatsappUrl = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
    window.open(whatsappUrl, '_blank');

    // Limpiar carrito tras ordenar
    cart = [];
    updateCartUI();
});