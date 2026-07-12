/* ==========================================================================
   CARRITO SEIJAKU v3.0 - CATEGORÍAS Y TICKET PROFESIONAL
   ========================================================================== */

const WHATSAPP_NUMBER = "5217721540533";
let cart = [];
let notificationTimeout = null; 
let hasShownNotification = false; 

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
const notificationDiv = document.getElementById('notification');

/* ------------------------------------------------------------------
   1. ROLLO PERSONALIZADO
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
   2. MANEJO DE CALPIS DINÁMICO
------------------------------------------------------------------ */
if (calpisSelect && calpisBtn) {
    calpisSelect.addEventListener('change', function() {
        calpisBtn.setAttribute('data-name', "Calpis de la Casa (" + this.value + ")");
    });
}

/* ------------------------------------------------------------------
   3. ESCUCHA GLOBAL DE EVENTOS (AÑADIR AL CARRITO)
------------------------------------------------------------------ */
document.addEventListener('click', function(e) {
    var btn = e.target.closest('.add-to-cart, .add-to-cart-variant');
    if (!btn) return;

    e.preventDefault();

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

    if (btn.id === 'calpis-btn' && calpisSelect) {
        var currentFlavor = calpisSelect.value;
        var calpisPrice = parseInt(btn.getAttribute('data-price')) || 70;
        addToCart("Calpis de la Casa (" + currentFlavor + ")", calpisPrice);
        feedbackButton(btn, 'Añadir al carrito');
        return;
    }

    var name = btn.getAttribute('data-name');
    var priceAttr = btn.getAttribute('data-price');
    var price = 0;

    if (priceAttr) {
        var cleanPrice = String(priceAttr).replace(/[^0-9]/g, '');
        price = parseInt(cleanPrice) || 0;
    } else {
        if (name && name.toLowerCase().includes('mochi')) price = 60;
        if (name && name.toLowerCase().includes('kushiage')) price = 55;
        if (name && name.toLowerCase().includes('yakimeshi')) price = 80;
    }

    if (price === 0 && btn.textContent) {
        var match = btn.textContent.match(/\d+/);
        if (match) price = parseInt(match[0]);
    }

    var originalText = btn.textContent || "Añadir al carrito";

    if (name && price > 0) {
        addToCart(name, price);
        feedbackButton(btn, originalText);
    }
});

function addToCart(name, price) {
    cart.push({ name: name, price: price });
    updateCartUI();
    
    if (cart.length === 1 && !hasShownNotification) {
        showFlashNotification();
    }

    // 🛍️ ANIMACIÓN DE SACUDIDA EN LA BOLSA FLOTANTE SEIJAKU
    if (cartFloatingBtn) {
        cartFloatingBtn.classList.add('shake-cart');
        
        // Removemos la clase después de 500ms para que pueda volver a agitarse en el siguiente clic
        setTimeout(function() {
            cartFloatingBtn.classList.remove('shake-cart');
        }, 500);
    }
}

function feedbackButton(btn, originalText) {
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
   4. NOTIFICACIÓN PUSH TEMPORAL (UNA SOLA VEZ - TAMAÑO CORREGIDO)
------------------------------------------------------------------ */
if (typeof window.seijakuNotifMostrada === 'undefined') {
    window.seijakuNotifMostrada = false;
}

function showFlashNotification() {
    var notif = document.getElementById('notification');
    if (!notif) return;
    
    // Si ya se mostró una vez, no hace nada
    if (window.seijakuNotifMostrada) return; 

    var currentTotal = 0;
    if (typeof cart !== 'undefined' && cart.forEach) {
        cart.forEach(function(item) { currentTotal += item.price; });
    }
    if (currentTotal >= 200) return;

    window.seijakuNotifMostrada = true;
    
    /* 🛠  APANADO DE ESTILOS PARA EVITAR QUE SE ESTIRE */
    notif.style.setProperty('height', 'auto', 'important');        
    notif.style.setProperty('min-height', 'auto', 'important');    
    notif.style.setProperty('width', '90%', 'important');          
    notif.style.setProperty('max-width', '360px', 'important');    
    notif.style.setProperty('padding', '14px 24px', 'important');  
    notif.style.setProperty('border-radius', '30px', 'important'); 
    
    // Posicionamiento correcto arriba
    notif.style.setProperty('left', '50%', 'important');
    notif.style.setProperty('transform', 'translateX(-50%)', 'important');
    notif.style.setProperty('bottom', 'auto', 'important');        

    // Animación de entrada (Baja elegantemente)
    notif.style.setProperty('top', '20px', 'important');
    notif.style.setProperty('opacity', '1', 'important');
    notif.style.setProperty('visibility', 'visible', 'important');

    // Se oculta automáticamente a los 3.5 segundos
    setTimeout(function() {
        notif.style.setProperty('top', '-100px', 'important');
        notif.style.setProperty('opacity', '0', 'important');
        setTimeout(function() {
            notif.style.setProperty('visibility', 'hidden', 'important');
        }, 400);
    }, 3500);
}

/* ------------------------------------------------------------------
   5. INTERFAZ DE USUARIO (Bolsa flotante)
------------------------------------------------------------------ */
function updateCartUI() {
    if (cartCountBadge) cartCountBadge.textContent = cart.length;

    if (cart.length > 0) {
        if (cartFloatingBtn) cartFloatingBtn.classList.remove('hidden');
        
        // En cuanto detecta que hay productos en la bolsa, manda llamar la alerta
        showFlashNotification();
        
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
                if (cart.length > 0) renderCartModal();
            });
        })(index);

        right.appendChild(subtotalSpan);
        right.appendChild(removeBtn);
        row.appendChild(left);
        row.appendChild(right);
        cartItemsList.appendChild(row);
    });

    if (cartTotalPrice) cartTotalPrice.textContent = '$' + total;
}

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

/* ------------------------------------------------------------------
   6. MODO OSCURO PREMIUM AUTOMÁTICO
------------------------------------------------------------------ */
function checkAutomaticDarkMode() {
    const currentHour = new Date().getHours();
    if (currentHour >= 19 || currentHour < 6) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}
document.addEventListener('DOMContentLoaded', checkAutomaticDarkMode);

/* ------------------------------------------------------------------
   6.1 TIEMPO DE ENTREGA ESTIMADO DINÁMICO (HORARIOS SEIJAKU)
------------------------------------------------------------------ */
function updateEstimatedTime() {
    const timeDisplay = document.getElementById('estimated-time-display');
    if (!timeDisplay) return;

    const now = new Date();
    const day = now.getDay(); // 0 = Domingo, 2 = Martes, etc.
    const hour = now.getHours();

    // 🛑 1️⃣ CANDADO DE DÍA DE DESCANSO: Martes cerrado
    if (day === 2) {
        timeDisplay.innerHTML = `🛵 *Hoy martes descansamos.* ¡Te esperamos mañana desde la 1:00 PM!`;
        return;
    }

    let minTime = 30;
    let maxTime = 40; // ⏱️ Tiempo regular establecido

    // 2️⃣ De 1:00 PM a 4:00 PM (Demanda baja de apertura - Entrega rápida)
    if (hour >= 13 && hour < 16) {
        minTime = 20;
        maxTime = 30;
    } 
    // 3️⃣ De 4:00 PM a 7:00 PM (⚠️ HORA PICO - Alta demanda)
    else if (hour >= 16 && hour < 19) {
        minTime = 40;
        maxTime = 55;
    } 
    // 4️⃣ De 7:00 PM a 10:00 PM (Tiempo regular hacia el cierre)
    else if (hour >= 19 && hour < 22) {
        minTime = 30;
        maxTime = 40;
    }
    // Fuera de horario general (Cerrado por la noche/mañana)
    else {
        timeDisplay.innerHTML = `🛵 *Cocina cerrada.* Abrimos de 1:00 PM a 10:00 PM (Martes cerrado)`;
        return;
    }

    timeDisplay.innerHTML = `⏱️ *Tiempo estimado de entrega actual:* ${minTime} - ${maxTime} min`;
}

// Ejecutar automáticamente al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    updateEstimatedTime();
    setInterval(updateEstimatedTime, 300000); 
});
/* ------------------------------------------------------------------
   7. FORMATO TICKET DE WHATSAPP (CON ENVÍO DINÁMICO Y MEMORIA)
------------------------------------------------------------------ */

// 💾 A) AL CARGAR LA PÁGINA: Recuperar datos guardados del cliente
document.addEventListener('DOMContentLoaded', function() {
    const savedName = localStorage.getItem('seijaku_client_name');
    const savedPhone = localStorage.getItem('seijaku_client_phone');
    const savedAddress = localStorage.getItem('seijaku_client_address');

    if (savedName) {
        const nameInput = document.getElementById('client-name');
        if (nameInput) nameInput.value = savedName;
    }
    if (savedPhone) {
        const phoneInput = document.getElementById('client-phone');
        if (phoneInput) phoneInput.value = savedPhone;
    }
    if (savedAddress) {
        const addressInput = document.getElementById('client-address');
        if (addressInput) addressInput.value = savedAddress;
    }
});

if (checkoutForm) {
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();

        var nameInput = document.getElementById('client-name');
        var phoneInput = document.getElementById('client-phone');
        var addressInput = document.getElementById('client-address');

        var clientName = nameInput ? nameInput.value : "No provisto";
        var clientPhone = phoneInput ? phoneInput.value : "No provisto";
        var clientAddress = addressInput ? addressInput.value : "No provisto";

        // 💾 B) AL ENVIAR PEDIDO: Guardar los datos actuales en el navegador
        localStorage.setItem('seijaku_client_name', clientName);
        localStorage.setItem('seijaku_client_phone', clientPhone);
        localStorage.setItem('seijaku_client_address', clientAddress);

        // GENERACIÓN DEL NÚMERO DE PEDIDO (Aleatorio de 4 dígitos)
        var numeroPedido = Math.floor(1000 + Math.random() * 9000);

        // CONSTRUCCIÓN DEL TICKET ELEGANTE
        var message = "🍣 *SEIJAKU - PEDIDO #" + numeroPedido + "* 🍣\n"; 
        message += "──────────────────────────\n";
        message += "👤 *Cliente:* " + clientName + "\n";
        message += "📞 *Teléfono:* " + clientPhone + "\n";
        message += "📍 *Entrega:* " + clientAddress + "\n";
        message += "──────────────────────────\n";
        message += "🛍️ *DETALLE DEL PEDIDO:*\n\n";

        // Contar y agrupar productos repetidos
        var counts = {};
        cart.forEach(function(item) {
            counts[item.name] = (counts[item.name] || 0) + 1;
        });

        var subtotal = 0;
        for (var itemName in counts) {
            var quantity = counts[itemName];
            var unitPrice = cart.find(i => i.name === itemName).price;
            var itemSubtotal = unitPrice * quantity;
            subtotal += itemSubtotal;

            message += "• *" + quantity + "x* " + itemName + " _($" + itemSubtotal + ")_\n";
        }

        // 🛵 CALCULAR SI SE APLICA COSTO DE ENVÍO ($20 si es menor a $200)
        var envioCosto = 0;
        var mensajeEnvio = "";
        if (subtotal < 200) {
            envioCosto = 20;
            mensajeEnvio = "🛵 *Envío:* $20 MXN\n";
        } else {
            mensajeEnvio = "🛵 *Envío:* ¡GRATIS!\n";
        }

        var totalFinal = subtotal + envioCosto;

        message += "──────────────────────────\n";
        message += "📦 *Subtotal:* $" + subtotal + " MXN\n";
        message += mensajeEnvio; // Pinta si es gratis o si son $20
        message += "──────────────────────────\n";
        message += "💰 *TOTAL A PAGAR:* $" + totalFinal + " MXN\n";
        message += "──────────────────────────\n";
        message += "🛵 _Pedido enviado desde el menú digital. ¡Gracias!_\nUn miembro del equipo responderá a este mensaje."; 

        var whatsappUrl = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
        window.open(whatsappUrl, '_blank');

        cart = [];
        updateCartUI();
    });

    /* ==========================================================================
   ⚠️ BANNER TEMPORAL DE "NO HAY SERVICIO" (BORRAR MAÑANA AL ABRIR)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', function() {
    // 1. Creamos el banner estilizado
    const avisoBanner = document.createElement('div');
    avisoBanner.id = 'seijaku-temp-banner';
    avisoBanner.style.backgroundColor = '#922b21'; // Color vino/rojo oscuro elegante
    avisoBanner.style.color = '#ffffff';
    avisoBanner.style.padding = '12px 15px';
    avisoBanner.style.textAlign = 'center';
    avisoBanner.style.fontSize = '14px';
    avisoBanner.style.fontWeight = '600';
    avisoBanner.style.fontFamily = 'sans-serif';
    avisoBanner.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    avisoBanner.style.zIndex = '9999';
    avisoBanner.style.position = 'relative';
    
    // Contenido del mensaje corto
    avisoBanner.innerHTML = `🛑 Aviso: Hoy no tendremos servicio. ¡Los esperamos mañana en nuestro horario habitual! 🍣`;

    // 2. Lo colocamos dinámicamente justo abajo de la barra verde matcha
    // Buscamos el header de tu página. Si no lo encuentra, lo pone al principio del body.
    const header = document.querySelector('header') || document.querySelector('.navbar') || document.body.firstChild;
    
    if (header && header.parentNode) {
        header.parentNode.insertBefore(avisoBanner, header.nextSibling);
    } else {
        document.body.insertBefore(avisoBanner, document.body.firstChild);
    }
});
}