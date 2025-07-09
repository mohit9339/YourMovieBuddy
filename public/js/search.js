(() => {
  const API_KEY = "5a5aa1df6b6c58301b9f3b307582dccd";
  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

  let currentPage = 1;
  let isLoading = false;
  let currentQuery = "";

  document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("query");
    if (query) {
      currentQuery = query;
      document.getElementById("searchInput").value = query;
      fetchSearchResults(query, currentPage);
    }

    window.addEventListener("scroll", handleScroll);
  });

  function fetchSearchResults(query, page) {
    if (isLoading) return;
    isLoading = true;

    fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`)
      .then(res => res.json())
      .then(data => {
        const container = document.getElementById("searchResults");
        data.results.forEach(movie => {
          if (movie.poster_path) {
            const div = document.createElement("div");
            div.className = "bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300";
            div.innerHTML = `
              <a href="movie.html?id=${movie.id}" class="block">
                <img src="${IMAGE_BASE_URL + movie.poster_path}" 
                     alt="${movie.title}" 
                     class="w-full h-[360px] object-cover"/>
                <h3 class="text-center text-sm font-medium mt-2 mb-3 px-2 truncate">${movie.title}</h3>
              </a>
            `;
            container.appendChild(div);
          }
        });

        if (data.page < data.total_pages) {
          currentPage++;
          isLoading = false;
        }
      })
      .catch(err => {
        console.error("Error fetching search results:", err);
        isLoading = false;
      });
  }

  function handleScroll() {
    const scrollPosition = window.innerHeight + window.scrollY;
    const bottomOffset = document.body.offsetHeight - 100;
    if (scrollPosition >= bottomOffset) {
      fetchSearchResults(currentQuery, currentPage);
    }
  }

  // ✅ Register globally
  window.searchMovies = function () {
    const query = document.getElementById("searchInput").value.trim();
    if (!query) return;
    window.location.href = `search.html?query=${encodeURIComponent(query)}`;
  };
})();
