// --- Variables Globales ---
const TOTAL_BOLETOS = 100;
// Base de datos local (se guarda en el navegador)
let rifaBD = JSON.parse(localStorage.getItem('rifa_jeffery_mobile_single')) || {};
let numeroTocado = null;

// --- Elementos del DOM ---
const gridElement = document.getElementById('grid');
const inputTelefono = document.getElementById('phone');
const inputNombre = document.getElementById('fullName');
const inputNumDisplay = document.getElementById('selectedNum');
const winnerBox = document.getElementById('winnerBox');
const winnerInfo = document.getElementById('winnerInfo');
const statusLabel = document.getElementById('status');

// --- 1. VALIDACIÓN EN TIEMPO REAL: Solo números en el teléfono ---
inputTelefono.addEventListener('input', function() {
    // Reemplaza cualquier cosa que NO sea un número (0-9)
    this.value = this.value.replace(/[^0-9]/g, '');
});

// --- 2. GENERAR LA CUADRÍCULA DE NÚMEROS ---
function dibujarGrid() {
    gridElement.innerHTML = '';
    for (let i = 1; i <= TOTAL_BOLETOS; i++) {
        const boton = document.createElement('button');
        boton.innerText = i;
        boton.className = 'num-btn';
        
        // Si el número ya está registrado (ocupado)
        if (rifaBD[i]) {
            boton.classList.add('occupied');
        }

        boton.onclick = () => {
            if (rifaBD[i]) {
                alert(`❌ Este número ya está apartado por: ${rifaBD[i].nombre}`);
                return;
            }
            // Quitar selección previa de cualquier otro botón
            document.querySelectorAll('.num-btn').forEach(b => b.classList.remove('selected'));
            // Seleccionar el botón actual
            boton.classList.add('selected');
            numeroTocado = i;
            inputNumDisplay.value = `Número seleccionado: ${i}`;
            
            // Intenta hacer vibrar el celular (solo Android, si lo soporta)
            if (window.navigator.vibrate) window.navigator.vibrate(40);
        };
        gridElement.appendChild(boton);
    }
}

// --- 3. FUNCIÓN: REGISTRAR PARTICIPANTE ---
document.getElementById('btnRegister').onclick = () => {
    const nombreCompleto = inputNombre.value.trim();
    const telefonoNum = inputTelefono.value.trim();

    // Validaciones básicas
    if (!nombreCompleto || telefonoNum.length < 10 || !numeroTocado) {
        alert("⚠️ Por favor llena tu nombre, teléfono (10 dígitos) y toca un número en la cuadrícula.");
        return;
    }

    // Guardar en el objeto y en LocalStorage
    rifaBD[numeroTocado] = { nombre: nombreCompleto, tel: telefonoNum };
    localStorage.setItem('rifa_jeffery_mobile_single', JSON.stringify(rifaBD));
    
    alert(`✅ ¡Número ${numeroTocado} reservado con éxito para ${nombreCompleto}!`);
    
    // Limpiar campos para un nuevo registro
    inputNombre.value = '';
    inputTelefono.value = '';
    inputNumDisplay.value = '';
    numeroTocado = null;
    dibujarGrid(); // Refrescar la cuadrícula
    window.scrollTo(0, 0); // Subir al inicio de la página
};

// --- 4. FUNCIÓN: REALIZAR SORTEO (Un Solo Ganador) ---
document.getElementById('btnSortear').onclick = function() {
    const clavesVendidas = Object.keys(rifaBD);
    if (clavesVendidas.length === 0) {
        alert("¡Faltan participantes! No hay números vendidos todavía.");
        return;
    }

    // Mostrar el cuadro del ganador y subir la pantalla automáticamente
    winnerBox.style.display = "block";
    winnerBox.scrollIntoView({ behavior: 'smooth' }); // Efecto de scroll suave
    
    // Resetear textos
    statusLabel.innerText = "🎲 ¡Buscando al ganador único!";
    winnerInfo.innerText = "🎲 Girando la tómbola...";
    
    let count = 0;
    // Efecto visual de tómbola (números rápidos)
    const tómbola = setInterval(() => {
        // Elige un nombre al azar rápido
        const randomKey = clavesVendidas[Math.floor(Math.random() * clavesVendidas.length)];
        winnerInfo.innerText = rifaBD[randomKey].nombre;
        count++;

        // Tiempo que dura la tómbola girando
        if (count > 35) {
            clearInterval(tómbola); // Detener la tómbola

            // ELEGIR AL GANADOR FINAL
            const ganadorKey = clavesVendidas[Math.floor(Math.random() * clavesVendidas.length)];
            const datosGanador = rifaBD[ganadorKey];
            
            // Revelar ganador
            statusLabel.innerText = "🏆 ¡TENEMOS UN GANADOR! 🏆";
            winnerInfo.innerHTML = `
                <span style="font-size: 1.4rem; color: #b8860b;">${datosGanador.nombre}</span><br>
                Boleto: #${ganadorKey}<br>
                <small>Tel: ${datosGanador.tel}</small>
            `;
            
            // Vibración de celebración (solo Android)
            if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100, 50, 300]);
        }
    }, 70); // Velocidad del giro
};

// --- 5. FUNCIÓN: REINICIAR RIFA ---
document.getElementById('btnReset').onclick = () => {
    if(confirm("⚠ ¿Estás seguro de borrar TODOS los registros? Esto no se puede deshacer.")) {
        // Borrar del almacenamiento del navegador
        localStorage.removeItem('rifa_jeffery_mobile_single');
        // Recargar la página para limpiar todo
        location.reload();
    }
};

// --- Iniciar la cuadrícula al cargar la página ---
dibujarGrid();