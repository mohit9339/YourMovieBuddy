document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");

  const email = localStorage.getItem("userEmail");
  if (email) {
    // Already logged in, redirect to homepage
    window.location.href = "index.html";
  }


  
  // 🔐 Signup logic
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = signupForm.email.value.trim();
      const password = signupForm.password.value;
      const confirmPassword = signupForm.confirmPassword.value;

      if (!email || !password || !confirmPassword) {
        return alert("Please fill in all fields.");
      }

      if (password !== confirmPassword) {
        return alert("Passwords do not match.");
      }

      try {
        const res = await fetch("http://localhost:3000/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok) {
          alert("Signup successful! Please log in.");
          window.location.href = "login.html";
        } else {
          alert(data.message || "Signup failed.");
        }
      } catch (err) {
        console.error("❌ Signup error:", err);
        alert("Server error during signup.");
      }
    });
  }

  // 🔐 Login logic
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = loginForm.email.value.trim();
      const password = loginForm.password.value;

      if (!email || !password) {
        return alert("Please enter both email and password.");
      }

      try {
        const res = await fetch("http://localhost:3000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok) {
          localStorage.setItem("userEmail", email); 
          alert("Login successful!");
          window.location.href = "index.html";
        } else {
          alert(data.message || "Login failed.");
        }
      } catch (err) {
        console.error("❌ Login error:", err);
        alert("Server error during login.");
      }
    });
  }
});
