const API_KEY = "5a5aa1df6b6c58301b9f3b307582dccd";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

let genreId = null;
let currentPage = 1;
let isLoading = false;

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  genreId = params.get("genre");

  if (genreId) {
    fetchGenreName(genreId);
    fetchGenreMovies(genreId, currentPage);
  }

  window.addEventListener("scroll", handleScroll);
});

function fetchGenreMovies(genreId, page) {
  if (isLoading) return;
  isLoading = true;

  fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=${page}`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("genreMovies");

      data.results.forEach(movie => {
        if (!movie.poster_path) return;

        const div = document.createElement("div");
        div.className = "bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition";

        div.innerHTML = `
          <a href="movie.html?id=${movie.id}">
            <img 
              src="${IMAGE_BASE_URL + movie.poster_path}" 
              alt="${movie.title}" 
              class="w-full aspect-[2/3] object-cover"
            />
            <div class="p-2 text-center">
              <h3 class="text-sm font-medium truncate">${movie.title}</h3>
            </div>
          </a>
        `;

        container.appendChild(div);
      });

      if (data.page < data.total_pages) {
        currentPage++;
        isLoading = false;
      }
    })
    .catch(err => {
      console.error("❌ Error fetching genre movies:", err);
      isLoading = false;
    });
}

function handleScroll() {
  const scrollPosition = window.innerHeight + window.scrollY;
  const bottomOffset = document.body.offsetHeight - 100;

  if (scrollPosition >= bottomOffset) {
    fetchGenreMovies(genreId, currentPage);
  }
}

function fetchGenreName(genreId) {
  fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      const genre = data.genres.find(g => g.id == genreId);
      if (genre) {
        document.getElementById("genreTitle").textContent = `Genre: ${genre.name}`;
      }
    });
}

function searchMovies() {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) return;
  window.location.href = `search.html?query=${encodeURIComponent(query)}`;
}
