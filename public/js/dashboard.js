const API_KEY = "5a5aa1df6b6c58301b9f3b307582dccd";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

document.addEventListener("DOMContentLoaded", () => {
  const user = getCurrentUser();
  if (!user) {
    alert("Please login to access the dashboard.");
    window.location.href = "login.html";
    return;
  }

  fetchUserLists(user.email);
});

// 🔐 Get current user from localStorage
function getCurrentUser() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.email ? user : null;
  } catch {
    return null;
  }
}

// 📦 Fetch user lists from backend
function fetchUserLists(email) {
  fetch(`http://localhost:3000/api/user/${email}/lists`)
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch lists.");
      return res.json();
    })
    .then(data => {
      loadMoviesFromIds(data.watched, "watchedList", "watched");
      loadMoviesFromIds(data.favorites, "favoritesList", "favorites");
    })
    .catch(err => {
      console.error("❌ Dashboard error:", err);
      alert("Could not load dashboard movies.");
    });
}

// 🎬 Load movie cards by TMDB IDs
function loadMoviesFromIds(ids, containerId, type) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (!Array.isArray(ids) || ids.length === 0) {
    container.innerHTML = "<p class='text-gray-400 italic'>No movies added yet.</p>";
    return;
  }

  ids.forEach(id => {
    fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`)
      .then(res => res.json())
      .then(movie => {
        if (movie.poster_path) {
          const card = document.createElement("div");
          card.className = "bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col";

          card.innerHTML = `
            <a href="movie.html?id=${movie.id}">
            <img src="${IMAGE_BASE_URL + movie.poster_path}" alt="${movie.title}" class="w-full aspect-[2/3] object-cover" />

            </a>
            <div class="p-3 flex flex-col items-center justify-between flex-grow">
              <h4 class="text-sm font-medium text-center truncate w-full mb-2">${movie.title}</h4>
              <button 
                onclick="removeFromList('${type}', ${movie.id})"
                class="text-xs px-3 py-1.5 border border-red-500 text-red-400 hover:bg-red-600 hover:text-white rounded transition duration-200"
              >
                Remove
              </button>
            </div>
          `;

          container.appendChild(card);
        }
      })
      .catch(err => {
        console.error(`❌ Failed to load movie ${id}:`, err);
      });
  });
}


// ❌ Remove movie from a list
function removeFromList(type, movieId) {
  const user = getCurrentUser();
  if (!user) {
    alert("Please login.");
    return;
  }

  fetch(`http://localhost:3000/api/user/${user.email}/lists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, movieId, action: "remove" })
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to remove from list.");
      return res.json();
    })
    .then(data => {
      console.log("✅ Removed:", data.message);
      location.reload();
    })
    .catch(err => {
      console.error("❌ Remove error:", err);
      alert("Failed to update your list.");
    });
}
