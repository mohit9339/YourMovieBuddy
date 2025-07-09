function logout() {
  try {
    localStorage.removeItem("userEmail");
    window.location.href = "login.html";
  } catch (error) {
    alert("Logout failed. Try again.");
    console.error("Logout error:", error);
  }
}

