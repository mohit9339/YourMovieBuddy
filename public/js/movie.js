const API_KEY = "5a5aa1df6b6c58301b9f3b307582dccd";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

document.addEventListener("DOMContentLoaded", () => {
  const movieId = getMovieIdFromURL();
  if (!movieId) {
    alert("Movie ID missing in URL.");
    return;
  }

  fetchMovieDetails(movieId);
  fetchAndHighlightUserLists(movieId);
});

function getMovieIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function fetchMovieDetails(id) {
  fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      displayMovieDetails(data);
      const genreIds = data.genres.map(g => g.id);
      fetchRelatedMovies(genreIds, data.id);

      if (data.imdb_id) fetchIMDBRating(data.imdb_id);
      fetchMovieDirector(data.id); // ✅ Fetch director info
    })
    .catch(err => {
      console.error("❌ Error fetching movie:", err);
      alert("Failed to load movie.");
    });
}

function displayMovieDetails(movie) {
  document.getElementById("moviePoster").src = IMAGE_BASE_URL + movie.poster_path;
  document.getElementById("moviePoster").alt = movie.title;
  document.getElementById("movieTitle").textContent = movie.title;
  document.getElementById("movieRelease").innerHTML = `<strong>Release Date:</strong> ${movie.release_date}`;
  document.getElementById("movieGenres").innerHTML = `<strong>Genres:</strong> ${movie.genres.map(g => g.name).join(", ")}`;
  document.getElementById("movieOverview").innerHTML = `<strong>Overview:</strong> ${movie.overview}`;
}

function fetchMovieDirector(movieId) {
  fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      const director = data.crew.find(person => person.job === "Director");
      const directorEl = document.getElementById("movieDirector");

      if (director) {
        directorEl.innerHTML = `
          <strong>Director:</strong> 
          <a href="director_info.html?id=${director.id}" class="text-gray-400 hover:underline">
            ${director.name}
          </a>
        `;
      } else {
        directorEl.innerHTML = `<strong>Director:</strong> N/A`;
      }
    })
    .catch(err => {
      console.error("❌ Error fetching director:", err);
    });
}

function fetchIMDBRating(imdbId) {
  fetch(`http://localhost:3000/api/imdb-rating/${imdbId}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("imdbRating").textContent = `IMDb Rating: ${data.rating || "N/A"}`;
    })
    .catch(err => {
      console.error("❌ IMDb rating fetch error:", err);
      document.getElementById("imdbRating").textContent = "IMDb Rating: N/A";
    });
}

function fetchAndHighlightUserLists(movieId) {
  const email = localStorage.getItem("userEmail");
  if (!email) return;

  fetch(`http://localhost:3000/api/user/${email}/lists`)
    .then(res => res.json())
    .then(lists => {
      if (lists.favorites.includes(+movieId)) updateButton("favorites", true);
      if (lists.watched.includes(+movieId)) updateButton("watched", true);
    })
    .catch(err => console.error("❌ Fetch user lists error:", err));
}

function toggleList(type) {
  const btn = document.querySelector(`button[data-type="${type}"]`);
  const isRemoving = btn.classList.contains("bg-red-500");

  if (isRemoving) {
    removeFromList(type);
  } else {
    addToList(type);
  }
}

function addToList(type) {
  const movieId = parseInt(getMovieIdFromURL());
  const email = localStorage.getItem("userEmail");
  if (!email) {
    alert("Please login first.");
    return;
  }

  fetch(`http://localhost:3000/api/user/${email}/lists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, movieId, action: "add" })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      updateButton(type, true);
    })
    .catch(err => {
      console.error("❌ Add to list error:", err);
      alert("Failed to update list.");
    });
}

function removeFromList(type) {
  const movieId = parseInt(getMovieIdFromURL());
  const email = localStorage.getItem("userEmail");
  if (!email) {
    alert("Please login first.");
    return;
  }

  fetch(`http://localhost:3000/api/user/${email}/lists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, movieId, action: "remove" })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      updateButton(type, false);
    })
    .catch(err => {
      console.error("❌ Remove from list error:", err);
    });
}

function updateButton(type, isInList) {
  const btn = document.querySelector(`button[data-type="${type}"]`);
  if (!btn) return;

  if (isInList) {
    btn.textContent = `Remove from ${capitalize(type)}`;
    btn.classList.remove("border-blue-500", "text-blue-400", "hover:bg-blue-500");
    btn.classList.remove("border-pink-500", "text-pink-400", "hover:bg-pink-500");
    btn.classList.add("bg-red-500", "hover:bg-red-600", "text-white","border-red-500");
  } else {
    btn.textContent = `Add to ${capitalize(type)}`;
    btn.classList.remove("bg-red-500", "hover:bg-red-600", "text-white","border-red-500");
    if (type === "favorites") {
      btn.classList.add("border-pink-500", "text-pink-400", "hover:bg-pink-500");
    } else {
      btn.classList.add("border-blue-500", "text-blue-400", "hover:bg-blue-500");
    }
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function fetchRelatedMovies(genreIds, currentMovieId) {
  const genreQuery = genreIds.join(",");
  fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreQuery}&sort_by=popularity.desc`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("relatedMovies");
      container.innerHTML = "";

      data.results
        .filter(m => m.poster_path && m.id !== currentMovieId)
        .slice(0, 20)
        .forEach(m => {
          const div = document.createElement("div");
          div.className = "movie-card shrink-0 w-40 mr-4";
          div.innerHTML = `
            <a href="movie.html?id=${m.id}" class="block">
              <img src="${IMAGE_BASE_URL + m.poster_path}" alt="${m.title}" class="w-full h-auto rounded shadow">
              <h3 class="mt-2 text-sm font-medium text-center text-white truncate">${m.title}</h3>
            </a>
          `;
          container.appendChild(div);
        });
    })
    .catch(err => console.error("❌ Related movies fetch error:", err));
}
