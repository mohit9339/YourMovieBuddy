// protect.js

document.addEventListener("DOMContentLoaded", () => {
  const email = localStorage.getItem("userEmail");

  // If userEmail is not found, redirect to login
  if (!email) {
    alert("You must be logged in to access this page.");
    window.location.href = "login.html";
  }
});
