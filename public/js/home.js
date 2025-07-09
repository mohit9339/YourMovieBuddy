const API_KEY = "5a5aa1df6b6c58301b9f3b307582dccd";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

document.addEventListener("DOMContentLoaded", () => {
  loadGenres();
  loadLanguages();
  loadPopularMovies();
  loadHindiMovies();
  loadCustomList("oscars", "oscarMovies");
  loadCustomList("cannes", "cannesMovies");
  loadCustomList("imdbTop", "imdbTopMovies");
});

// 🔍 Search Function
function searchMovies() {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) return;
  window.location.href = `search.html?query=${encodeURIComponent(query)}`;
}

// 🎞️ Movie Card Builder
function createMovieCard(movie) {
  const div = document.createElement("div");
  div.className = "w-40 flex-shrink-0 ";
  div.innerHTML = `
    <a href="movie.html?id=${movie.id}" class="block">
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}"
           class="w-full h-60 object-cover rounded-lg shadow-md hover:scale-105 transition-transform duration-300" />
      <h3 class="text-sm text-center mt-2">${movie.title}</h3>
    </a>
  `;
  return div;
}






// 🎬 Load Popular Hollywood Movies
function loadPopularMovies() {
  fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("popularMovies");
      container.innerHTML = "";
      data.results.forEach(movie => {
        if (movie.poster_path) container.appendChild(createMovieCard(movie));
      });
    });
}

// 🇮🇳 Load Bollywood (Hindi) Movies
function loadHindiMovies() {
  fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_original_language=hi&sort_by=popularity.desc`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("hindiMovies");
      container.innerHTML = "";
      data.results.forEach(movie => {
        if (movie.poster_path) container.appendChild(createMovieCard(movie));
      });
    });
}

// 📂 Load from custom movie ID list (like Oscars, Cannes, IMDb Top)
function loadCustomList(listKey, containerId) {
  fetch("data/top_movies.json")
    .then(res => res.json())
    .then(json => {
      const ids = shuffleArray(json[listKey]).slice(0, 20); // pick random 12
      ids.forEach(id => {
        fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`)
          .then(res => res.json())
          .then(movie => {
            if (movie.poster_path) {
              const container = document.getElementById(containerId);
              container.appendChild(createMovieCard(movie));
            }
          });
      });
    });
}

// 🔀 Shuffle helper
function shuffleArray(array) {
  return array.sort(() => 0.5 - Math.random());
}

// 🎛️ Load Genres into Dropdown
function loadGenres() {
  fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      const dropdown = document.getElementById("genreDropdown");
      data.genres.forEach(genre => {
        const option = document.createElement("option");
        option.value = genre.id;
        option.textContent = genre.name;
        dropdown.appendChild(option);
      });
    });
}

function loadLanguages() {
  fetch(`https://api.themoviedb.org/3/configuration/languages?api_key=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      const dropdown = document.getElementById("languageDropdown");
      // Filter to common spoken movie languages
      const commonLanguages = ["en", "hi", "fr", "ja", "ko", "es", "de", "it"];
      data.forEach(lang => {
        if (commonLanguages.includes(lang.iso_639_1)) {
          const option = document.createElement("option");
          option.value = lang.iso_639_1;
          option.textContent = lang.english_name;
          dropdown.appendChild(option);
        }
      });
    })
    .catch(err => console.error("❌ Failed to load languages:", err));
}

// 🌐 Language Filter Action
function filterByLanguage(languageCode) {
  if (!languageCode) return;
  window.location.href = `language.html?lang=${languageCode}`;
}


// 📂 Filter By Genre
function filterByGenre(genreId) {
  if (!genreId) return;
  window.location.href = `genre.html?genre=${genreId}`;
}


document.addEventListener("DOMContentLoaded", loadDirectorsCarousel);
