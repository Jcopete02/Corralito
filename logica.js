const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
const accountBtn = document.getElementById("account-btn");
const accountMenu = document.getElementById("account-menu");

// Toggle menú lateral
menuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

// Toggle submenu de Account
accountBtn.addEventListener("click", () => {
  accountMenu.style.display =
    accountMenu.style.display === "block" ? "none" : "block";
});

// Cerrar submenu si se hace clic fuera
document.addEventListener("click", (e) => {
  if (!accountBtn.contains(e.target) && !accountMenu.contains(e.target)) {
    accountMenu.style.display = "none";
  }
});

// ===== CLIMA EN TIEMPO REAL =====
const ubicacionEl = document.getElementById("ubicacion");
const temperaturaEl = document.getElementById("temperatura");
const descripcionEl = document.getElementById("descripcion");

// ⚠️ Reemplaza con tu API Key gratis de OpenWeatherMap
const API_KEY = "19cae1f2224f24f8a53cc724f59490f";

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(success, error);
} else {
  ubicacionEl.textContent = "Tu navegador no soporta GPS";
}

function success(pos) {
  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;

  fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${API_KEY}`
  )
    .then((res) => res.json())
    .then((data) => {
      ubicacionEl.textContent = `${data.name}, ${data.sys.country}`;
      temperaturaEl.textContent = `🌡️ ${data.main.temp}°C`;
      descripcionEl.textContent = `☁️ ${data.weather[0].description}`;
    })
    .catch(() => {
      ubicacionEl.textContent = "No se pudo obtener el clima.";
    });
}

function error() {
  ubicacionEl.textContent = "No se pudo acceder al GPS.";
}
// ===== FUNCIONES PARA CARGAR DATOS DEL TORNEO =====
document.addEventListener("DOMContentLoaded", () => {
    // Función para obtener y mostrar la tabla de goleadores
    const fetchGoleadores = async () => {
        try {
            const res = await fetch("https://corralito-seven.vercel.app/goleadores");
            const goleadores = await res.json();
            const tbody = document.getElementById("tabla-goleadores-body");
            tbody.innerHTML = ""; // Limpiar la tabla

            goleadores.forEach((goleador, index) => {
                const row = `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${goleador.Jugador}</td>
                        <td>${goleador.Goles}</td>
                        <td>${goleador.NombreEquipo}</td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        } catch (err) {
            console.error("Error al cargar goleadores:", err);
        }
    };

    // Función para obtener y mostrar la tabla de asistencias
    const fetchAsistencias = async () => {
        try {
            const res = await fetch("https://corralito-seven.vercel.app/asistencias");
            const asistencias = await res.json();
            const tbody = document.getElementById("tabla-asistencias-body");
            tbody.innerHTML = ""; // Limpiar la tabla

            asistencias.forEach((asistencia, index) => {
                const row = `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${asistencia.Jugador}</td>
                        <td>${asistencia.Asistencias}</td>
                        <td>${asistencia.NombreEquipo}</td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        } catch (err) {
            console.error("Error al cargar asistencias:", err);
        }
    };

    // Función para obtener y mostrar la información de los equipos
    const fetchEquipos = async () => {
        const equiposContainer = document.querySelector(".main .equipo-cards-container");
        if (!equiposContainer) {
            console.error("Contenedor de equipos no encontrado.");
            return;
        }

        for (let i = 1; i <= 16; i++) {
            try {
                const res = await fetch(`https://corralito-seven.vercel.app/equipos/${i}`);
                const jugadores = await res.json();
                
                const card = document.createElement("div");
                card.className = "card equipo-card";
                
                let tableHtml = `
                    <h3>Equipo ${i}</h3>
                    <table class="tabla-equipo">
                        <thead>
                            <tr>
                                <th>Jugador</th>
                                <th>Tipo de Sangre</th>
                                <th>Foto</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                if (jugadores.length > 0) {
                    jugadores.forEach(jugador => {
                        tableHtml += `
                            <tr>
                                <td>${jugador.Jugador}</td>
                                <td>${jugador.TipoSangre}</td>
                                <td><img src="${jugador.URLFoto}" alt="${jugador.Jugador}"></td>
                            </tr>
                        `;
                    });
                } else {
                    tableHtml += `
                        <tr>
                            <td colspan="3">No hay jugadores registrados.</td>
                        </tr>
                    `;
                }
                
                tableHtml += `
                        </tbody>
                    </table>
                `;
                
                card.innerHTML = tableHtml;
                equiposContainer.appendChild(card);
                
            } catch (err) {
                console.error(`Error al cargar el Equipo ${i}:`, err);
            }
        }
    };

    // Llamar a las funciones para cargar los datos al iniciar la página
    fetchGoleadores();
    fetchAsistencias();
    fetchEquipos();
});