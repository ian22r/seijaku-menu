/* ==========================================================================
   CARRITO SEIJAKU v2.4 (TOLERANTE A ELEMENTOS FALTANTES)
   ========================================================================== */

const WHATSAPP_NUMBER = "5217721540533";
let cart = [];

// Referencias DOM con protección de existencia
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
var checkboxGroups = [
    { selector: '#cover-checkbox-group',    max: 3 },
    { selector: '#fillings-checkbox-group', max: 3 },
    { selector: '#sauces-checkbox-group',   max: 3 }
];

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
    var basePrice = 145; 
    var selectedIngredients = [];

    var checkedBoxes = document.querySelectorAll('.custom-roll-block input[type="checkbox"]:checked');
    checkedBoxes.forEach(function(cb) {
        selectedIngredients.push(cb.value);
    });

    if (customRollBtn) {
        if (selectedIngredients.length > 0) {
            customRollBtn.setAttribute('data-name', "Rollo Personalizado (" + selectedIngredients.join(', ') + ")");
        } else {
            customRollBtn.setAttribute('data-name', "Rollo Personalizado (Por armar)");
        }
        customRollBtn.setAttribute('data-price', basePrice);
    }
}

/* ------------------------------------------------------------------
   MANEJO DE CALPIS DINÁMICO
------------------------------------------------------------------ */
if (calpisSelect && calpisBtn) {
    calpisSelect.addEventListener('change', function() {
        calpisBtn.setAttribute('data-name', "Calpis de la Casa (" + this.value + ")");
    });
}

/* ------------------------------------------------------------------
   AÑADIR AL CARRITO (ESCUCHA GLOBAL BLINDADA)
------------------------------------------------------------------ */
document.addEventListener('click', function(e) {
    var btn = e.target.closest('.add-to-cart, .add-to-cart-variant');
    if (!btn) return;

    // Detener comportamiento por defecto si es un enlace o botón dentro de form
    e.preventDefault();

    // Caso 1: Rollo Personalizado
    if (btn.id === 'add-custom-roll-btn') {
        var name = btn.getAttribute('data-name');
        if (!name || name === 'Rollo Personalizado (Por armar)') {
            alert("Por favor, selecciona al menos un ingrediente para armar tu rollo personalizado.");
            return;
        }
        var price = parseInt(btn.getAttribute('data-price')) || 145;
        addToCart(name, price);

        document.querySelectorAll('.custom-roll-block input[type="checkbox"]').forEach(function(cb) {
            cb.checked = false;
        });
        updateCustomRollData();
        feedbackButton(btn, 'Añadir al carrito');
        return;
    }

    // Caso 2: Calpis
    if (btn.id === 'calpis-btn' && calpisSelect) {
        var currentFlavor = calpisSelect.value;
        var calpisPrice = parseInt(btn.getAttribute('data-price')) || 70;
        addToCart("Calpis de la Casa (" + currentFlavor + ")", calpisPrice);
        feedbackButton(btn, 'Añadir al carrito');
        return;
    }

    // Caso 3: Botones Generales y Variantes (Mochis, Kushiages, Yakimeshi, Sushi normal, Ramen)
    var name = btn.getAttribute('data-name');
    var priceAttr = btn.getAttribute('data-price');
    var price = 0;

    if (priceAttr) {
        var cleanPrice = String(priceAttr).replace(/[^0-9]/g, '');
        price = parseInt(cleanPrice) || 0;
    } else {
        // Respaldos automáticos por texto si faltan atributos en tu HTML
        if (name && name.toLowerCase().includes('mochi')) price = 60;
        if (name && name.toLowerCase().includes('kushiage')) price = 55;
        if (name && name.toLowerCase().includes('yakimeshi')) price = 80;
    }

    // Si por alguna razón sigue dando 0, intentamos extraerlo del texto del propio botón
    if (price === 0 && btn.textContent) {
        var match = btn.textContent.match(/\d+/);
        if (match) price = parseInt(match[0]);
    }

    var originalText = btn.textContent || "Añadir al carrito";

    if (name && price > 0) {
        addToCart(name, price);
        feedbackButton(btn, originalText);
    } else {
        console.error("Faltan datos críticos en el botón. Asegúrate de tener data-name y un precio visible.");
    }
});

function addToCart(name, price) {
    cart.push({ name: name, price: price });
    updateCartUI();
}

function feedbackButton(btn, originalText) {
    // Si el texto original ya dice "¡Añadido!", evitamos bucles de texto
    if (originalText.includes("¡Añadido!")) return;

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
   INTERFAZ DE USUARIO (UI) CON VERIFICACIONES
------------------------------------------------------------------ */
function updateCartUI() {
    if (cartCountBadge) {
        cartCountBadge.textContent = cart.length;
    }
    
    if (cart.length > 0) {
        if (cartFloatingBtn) cartFloatingBtn.classList.remove('hidden');
    } else {
        if (cartFloatingBtn) cartFloatingBtn.classList.add('hidden');
        if (cartModal) cartModal.classList.add('hidden');
    }
}

function renderCartModal() {
    if (!cartItemsList) return;
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

    if (cartTotalPrice) {
        cartTotalPrice.textContent = '$' + total;
    }
}

/* ------------------------------------------------------------------
   ABRIR / CERRAR MODAL
------------------------------------------------------------------ */
if (cartFloatingBtn) {
    cartFloatingBtn.addEventListener('click', function() {
        renderCartModal();
        if (cartModal) cartModal.classList.remove('hidden');
    });
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', function() {
        if (cartModal) cartModal.classList.add('hidden');
    });
}

if (cartModal) {
    cartModal.addEventListener('click', function(e) {
        if (e.target === cartModal) cartModal.classList.add('hidden');
    });
}

/* ------------------------------------------------------------------
   ENVÍO DE PEDIDO A WHATSAPP
------------------------------------------------------------------ */
if (checkoutForm) {
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();

        var nameInput = document.getElementById('client-name');
        var phoneInput = document.getElementById('client-phone');
        var addressInput = document.getElementById('client-address');

        var clientName = nameInput ? nameInput.value : "No provisto";
        var clientPhone = phoneInput ? phoneInput.value : "No provisto";
        var clientAddress = addressInput ? addressInput.value : "No provisto";

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

        cart = [];
        updateCartUI();
    });
}