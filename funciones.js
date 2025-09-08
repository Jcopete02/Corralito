document.getElementById("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  try {
    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass })
    });


    const data = await res.json();
    
    if (data.success) {
      alert("✅ Bienvenido " + data.user.NombreUsuario + " (Rol: " + data.user.NombreRol + ")");
      window.location.href = "Entrada.html"; // tu dashboard
    } else {
      alert("❌ " + data.message);
    }
  } catch (err) {
    alert("⚠️ Error de conexión con el servidor");
  }
});
