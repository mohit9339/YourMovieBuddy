const API_KEY = "5a5aa1df6b6c58301b9f3b307582dccd";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const PROFILE_BASE_URL = "https://image.tmdb.org/t/p/w300";

document.addEventListener("DOMContentLoaded", () => {
  const directorId = getDirectorIdFromURL();
  if (!directorId) {
    alert("Director ID missing in URL.");
    return;
  }

  fetchDirectorDetails(directorId);
  fetchFilmography(directorId);
});

function getDirectorIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function fetchDirectorDetails(id) {
  fetch(`https://api.themoviedb.org/3/person/${id}?api_key=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      const profile = data.profile_path
        ? PROFILE_BASE_URL + data.profile_path
        : "https://via.placeholder.com/300x300?text=No+Image";

      document.getElementById("directorPhoto").src = profile;
      document.getElementById("directorPhoto").alt = data.name;
      document.getElementById("directorName").textContent = data.name;
      document.getElementById("directorBio").textContent = data.biography || "Biography not available.";
      document.getElementById("birthDetails").textContent = `Born: ${data.birthday || 'Unknown'}${data.place_of_birth ? ` in ${data.place_of_birth}` : ''}`;
    })
    .catch(err => {
      console.error("❌ Error fetching director details:", err);
      alert("Failed to load director information.");
    });
}

function fetchFilmography(id) {
  fetch(`https://api.themoviedb.org/3/person/${id}/movie_credits?api_key=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      const directedMovies = data.crew.filter(m => m.job === "Director" && m.release_date).sort((a, b) => {
        return new Date(a.release_date) - new Date(b.release_date);
      });

      const container = document.getElementById("filmographyList");
      container.innerHTML = "";

      directedMovies.forEach(movie => {
        const div = document.createElement("div");
        div.className = "bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300";
        div.innerHTML = `
          <a href="movie.html?id=${movie.id}" class="block">
            <img src="${movie.poster_path ? IMAGE_BASE_URL + movie.poster_path : 'https://via.placeholder.com/200x300?text=No+Image'}"
                 alt="${movie.title}"
                 class="w-full h-[360px] object-cover"/>
            <div class="p-2">
              <h3 class="text-sm font-medium truncate">${movie.title}</h3>
              <p class="text-xs text-gray-400">${movie.release_date}</p>
            </div>
          </a>
        `;
        container.appendChild(div);
      });
    })
    .catch(err => {
      console.error("❌ Error fetching filmography:", err);
      alert("Failed to load filmography.");
    });
}
