const API_BASE_URL = "https://yourmoviebuddy.onrender.com"; // Replace with your real backend URL

document.addEventListener("DOMContentLoaded", () => {
  // 🔄 Try both old and new formats
  const storedUser = localStorage.getItem("user");
  let email = "";

  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      email = parsed.email;
    } catch {
      email = "";
    }
  }

  // fallback to userEmail
  if (!email) {
    email = localStorage.getItem("userEmail");
  }

  // ❌ If still no email, redirect to login
  if (!email) {
    alert("Please login to view your profile.");
    window.location.href = "login.html";
    return;
  }

  // ✅ Display email
  const userInfo = document.getElementById("userEmail");
  if (userInfo) {
    userInfo.textContent = email;
  }

  // ✅ Fetch user's list
  fetch(`${API_BASE_URL}/api/user/${email}/lists`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("watchedCount").textContent = data.watched?.length || 0;
      document.getElementById("favoritesCount").textContent = data.favorites?.length || 0;
    })
    .catch(err => {
      console.error("❌ Error loading user movie lists:", err);
    });
});
