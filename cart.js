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
   EFECTO VISUAL: PARTÍCULA VOLADORA AL CARRITO
------------------------------------------------------------------ */
function animateFlyToCart(buttonElement) {
    // 1. Localizar el botón que se presionó y el icono del carrito flotante
    // Ajusta '#cart-icon' o '.cart-btn' según la clase/ID real de tu botón de carrito en el HTML
    const cartIcon = document.getElementById('cart-icon') || document.querySelector('.cart-button-floating');
    if (!buttonElement || !cartIcon) return;

    // 2. Obtener las coordenadas en pantalla de ambos elementos
    const btnRect = buttonElement.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    // 3. Crear el elemento visual (la partícula)
    const particle = document.createElement('div');
    particle.className = 'flying-particle';
    
    // Posicionar la partícula exactamente encima del botón presionado
    particle.style.left = `${btnRect.left + btnRect.width / 2 - 10}px`;
    particle.style.top = `${btnRect.top + btnRect.height / 2 - 10}px`;
    
    document.body.appendChild(particle);

    // 4. Forzar un pequeño delay para que el navegador registre la posición inicial antes de animar
    requestAnimationFrame(() => {
        // Mover la partícula hacia la posición del carrito
        particle.style.left = `${cartRect.left + cartRect.width / 2 - 10}px`;
        particle.style.top = `${cartRect.top + cartRect.height / 2 - 10}px`;
        particle.style.transform = 'scale(0.3)'; // Se hace más chiquita mientras vuela
        particle.style.opacity = '0.2';
    });

    // 5. Al terminar el vuelo (600ms), remover la partícula y hacer rebotar el carrito
    setTimeout(() => {
        particle.remove();
        
        // Agregar clase de rebote al carrito
        cartIcon.classList.add('cart-icon-bounce');
        
        // Quitar la clase después de que termine la animación para que pueda volver a usarse
        setTimeout(() => {
            cartIcon.classList.remove('cart-icon-bounce');
        }, 500);
    }, 600);
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
        var message = "🍣 *¡Hola Seijaku! Me gustaría hacer el siguiente pedido:#" + numeroPedido + "* 🍣\n"; 
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
}
/* ==========================================================================
   ✨ EFECTO VISUAL: ANIMACIÓN "VOLAR A LA BOLSITA" (VERSIÓN FINAL SEIJAKU)
   ========================================================================== */
(function() {
    // 1. Inyectamos los estilos CSS necesarios
    const style = document.createElement('style');
    style.innerHTML = `
        .flying-particle-matcha {
            position: fixed;
            width: 22px;
            height: 22px;
            background-color: #5d875a !important; /* Verde Matcha Seijaku */
            border-radius: 50%;
            z-index: 9999999;
            pointer-events: none;
            transition: all 0.7s cubic-bezier(0.25, 1, 0.5, 1);
            box-shadow: 0 0 10px rgba(93, 135, 90, 0.6);
        }
        @keyframes bentoBounce {
            0% { transform: scale(1); }
            30% { transform: scale(1.3) rotate(-10deg); }
            50% { transform: scale(0.85) rotate(6deg); }
            70% { transform: scale(1.1) rotate(-3deg); }
            100% { transform: scale(1) rotate(0deg); }
        }
        .bento-bounce-active {
            animation: bentoBounce 0.6s ease-in-out !important;
        }
    `;
    document.head.appendChild(style);

    // 2. Función que ejecuta el vuelo de la bolita matcha
    function runFlyAnimation(buttonElement) {
        const cartIcon = document.getElementById('cart-floating-btn');
        const bentoSvg = document.querySelector('.bento-svg');
        if (!buttonElement || !cartIcon) return;

        // Si el botón está oculto (.hidden), lo mostramos un microsegundo antes 
        // para poder calcular sus coordenadas reales en pantalla
        const wasHidden = cartIcon.classList.contains('hidden');
        if (wasHidden) {
            cartIcon.classList.remove('hidden');
        }

        const btnRect = buttonElement.getBoundingClientRect();
        const cartRect = cartIcon.getBoundingClientRect();

        // Si estaba oculto, lo volvemos a ocultar (tu lógica principal lo mostrará formalmente)
        if (wasHidden) {
            cartIcon.classList.add('hidden');
        }

        // Creamos la bolita matcha
        const particle = document.createElement('div');
        particle.className = 'flying-particle-matcha';
        
        // La centramos en el botón de agregar
        particle.style.left = `${btnRect.left + btnRect.width / 2 - 11}px`;
        particle.style.top = `${btnRect.top + btnRect.height / 2 - 11}px`;
        document.body.appendChild(particle);

        // Iniciamos el vuelo hacia la bolsita
        requestAnimationFrame(() => {
            particle.style.left = `${cartRect.left + cartRect.width / 2 - 11}px`;
            particle.style.top = `${cartRect.top + cartRect.height / 2 - 11}px`;
            particle.style.transform = 'scale(0.2)'; // Se encoge
            particle.style.opacity = '0.3';
        });

        // Al impactar la bolsita
        setTimeout(() => {
            particle.remove();
            
            // Hacemos rebotar el SVG de la bolsita premium
            if (bentoSvg) {
                bentoSvg.classList.add('bento-bounce-active');
                setTimeout(() => {
                    bentoSvg.classList.remove('bento-bounce-active');
                }, 600);
            }
        }, 700);
    }

    // 3. Escucha inteligente de clics en tus botones de agregar
    document.addEventListener('click', function(event) {
        const target = event.target;
        const isAddButton = target.closest('.btn-add') || 
                            target.closest('.add-to-cart') || 
                            target.closest('button[onclick*="cart"]') ||
                            (target.tagName === 'BUTTON' && target.textContent.toLowerCase().includes('agregar'));

        if (isAddButton) {
            runFlyAnimation(isAddButton);
        }
    });
})();



// Espera a que TODO el contenido de la página (imágenes, estilos, etc.) se cargue
window.addEventListener('load', function() {
    // Selecciona el elemento del preloader
    const preloader = document.getElementById('preloader');
    
    // Agrega una pequeña pausa opcional (ej. 500ms) para que la animación se aprecie bien
    // antes de empezar a ocultarlo. Si quieres que sea instantáneo, usa 0.
    setTimeout(function() {
        // Cambia la opacidad para que se desvanezca suavemente
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        
        // Reactiva el scroll en el body
        document.body.classList.remove('loading');
    }, 1000); // 1000 milisegundos = 1 segundo de retraso total
});

// Al inicio, agregamos la clase loading al body para bloquear el scroll
document.body.classList.add('loading');