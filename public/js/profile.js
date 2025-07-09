const API_BASE_URL = "https://yourmoviebuddy.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || !user.email) {
    alert("Please login to view your profile.");
    window.location.href = "login.html";
    return;
  }

  const userInfo = document.getElementById("userEmail");
  if (userInfo) {
    userInfo.textContent = user.email;
  }

  // Fetch user's lists
  fetch(`${API_BASE_URL}/api/user/${user.email}/lists`)
    .then(res => res.json())
    .then(data => {
      // Set counts
      document.getElementById("watchedCount").textContent = data.watched?.length || 0;
      document.getElementById("favoritesCount").textContent = data.favorites?.length || 0;
    })
    .catch(err => {
      console.error("❌ Error loading user movie lists:", err);
    });
});
