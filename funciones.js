document.getElementById("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  console.log("Intentando conectar a:", 'https://corralito-seven.vercel.app/api/login');

  try {
    const res = await fetch('https://corralito-seven.vercel.app/api/login', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass })
    });

    console.log("Respuesta recibida:", response);
    const data = await res.json();
    
    if (data.success) {
      alert("✅ Bienvenido " + data.user.NombreUsuario + " (Rol: " + data.user.NombreRol + ")");
      window.location.href = "Entrada.html"; // tu dashboard
    } else {
      alert("❌ " + data.message);
    }

  } catch (err) {
    console.error("Error completo:", err);
    alert("Error: " + err.message);
}
});
