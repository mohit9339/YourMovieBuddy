const API_KEY = "5a5aa1df6b6c58301b9f3b307582dccd";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

let page = 1;
let loading = false;
let languageCode = "";

document.addEventListener("DOMContentLoaded", () => {
  languageCode = new URLSearchParams(window.location.search).get("lang");
  if (!languageCode) {
    alert("No language selected.");
    return;
  }

  document.getElementById("languageTitle").textContent = `Movies in "${languageCode.toUpperCase()}"`;
  loadLanguageMovies();

  window.addEventListener("scroll", () => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
      !loading
    ) {
      loadLanguageMovies();
    }
  });
});

function loadLanguageMovies() {
  loading = true;
  document.getElementById("loading").classList.remove("hidden");

  fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_original_language=${languageCode}&sort_by=popularity.desc&page=${page}`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("languageMovies");

      data.results.forEach(movie => {
        if (movie.poster_path) {
          const div = document.createElement("div");
          div.className = "bg-gray-800 rounded overflow-hidden shadow hover:shadow-lg transition duration-300";

          div.innerHTML = `
            <a href="movie.html?id=${movie.id}" class="block">
              <img src="${IMAGE_BASE_URL + movie.poster_path}" alt="${movie.title}"
                   class="w-full aspect-[2/3] object-cover">
              <div class="p-2 text-center">
                <h3 class="text-sm font-medium truncate">${movie.title}</h3>
              </div>
            </a>
          `;

          container.appendChild(div);
        }
      });

      page++;
      loading = false;
      document.getElementById("loading").classList.add("hidden");
    })
    .catch(err => {
      console.error("❌ Error loading movies by language:", err);
      loading = false;
    });
}

function searchMovies() {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) return;
  window.location.href = `search.html?query=${encodeURIComponent(query)}`;
}
