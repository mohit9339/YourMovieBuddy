const API_KEY = "5a5aa1df6b6c58301b9f3b307582dccd";

document.addEventListener("DOMContentLoaded", () => {
  loadDirectorsPage();
});

function loadDirectorsPage() {
  const container = document.getElementById("directorsGrid");

  const FAMOUS_DIRECTORS = [
    { name: "Martin Scorsese", tmdbId: 1032 },
    { name: "Stanley Kubrick", tmdbId: 240 },
    { name: "Quentin Tarantino", tmdbId: 138 },
    { name: "Satyajit Ray", tmdbId: 12160 },
    { name: "Mrinal Sen", tmdbId: 1086288 },
    { name: "Anurag Kashyap", tmdbId: 85670 },
    { name: "David Fincher", tmdbId: 7467 },
    { name: "Paul Thomas Anderson", tmdbId: 4762 },
    { name: "Andrei Tarkovsky", tmdbId: 8452 },
    { name: "Abbas Kiarostami", tmdbId: 119294 },
    { name: "Christopher Nolan", tmdbId: 525 },
    { name: "Steven Spielberg", tmdbId: 488 },
    { name: "Wes Anderson", tmdbId: 5655 },
    { name: "Ingmar Bergman", tmdbId: 6648 },
    { name: "Wong Kar-wai", tmdbId: 12453 },
    { name: "Alfred Hitchcock", tmdbId: 2636 },
    { name: "Akira Kurosawa", tmdbId: 5026 },
    { name: "Ridley Scott", tmdbId: 578 },
    { name: "Bong Joon Ho", tmdbId: 21684 },
    { name: "Denis Villeneuve", tmdbId: 137427 }
  ];

  FAMOUS_DIRECTORS.forEach(director => {
    fetch(`https://api.themoviedb.org/3/person/${director.tmdbId}?api_key=${API_KEY}`)
      .then(res => res.json())
      .then(data => {
        const profileUrl = data.profile_path
          ? `https://image.tmdb.org/t/p/w300${data.profile_path}`
          : "https://via.placeholder.com/150?text=No+Image";

        const card = document.createElement("div");
        card.className = "text-center cursor-pointer hover:scale-105 transition-transform";
        card.innerHTML = `
        <a href="director_info.html?id=${director.tmdbId}" class="hover:scale-105 transition-transform block">
          <img src="${profileUrl}" alt="${data.name}" class="w-45 h-45 object-cover rounded-full shadow-lg mx-auto mb-2">
          <p class="text-sm font-semibold text-white truncate">${data.name}</p>
        </a>
        `;
        container.appendChild(card);
      })
      .catch(err => {
        console.error(`Failed to load director ${director.name}`, err);
      });
  });
}

function viewDirector(directorId) {
  window.location.href = `director.html?id=${directorId}`;
}


const input = document.getElementById("directorSearchInput");
const suggestions = document.getElementById("suggestions");

input.addEventListener("input", async () => {
  const query = input.value.trim();

  if (!query) {
    suggestions.innerHTML = "";
    suggestions.classList.add("hidden");
    return;
  }

  try {
    const res = await fetch(`https://api.themoviedb.org/3/search/person?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    const data = await res.json();

    const people = data.results.slice(0, 10); // Top 10 only
    const directors = [];

    for (const person of people) {
      const creditsRes = await fetch(`https://api.themoviedb.org/3/person/${person.id}/combined_credits?api_key=${API_KEY}`);
      const creditsData = await creditsRes.json();

      const directedSomething = creditsData.crew?.some(job => job.job === "Director");
      if (directedSomething) {
        directors.push(person);
      }
    }

    suggestions.innerHTML = "";
    if (directors.length === 0) {
      suggestions.classList.add("hidden");
      return;
    }

    directors.forEach(director => {
      const li = document.createElement("li");
      li.textContent = director.name;
      li.className = "px-4 py-2 hover:bg-gray-200 cursor-pointer";
      li.addEventListener("click", () => {
        window.location.href = `director_info.html?id=${director.id}`;
      });
      suggestions.appendChild(li);
    });

    suggestions.classList.remove("hidden");

  } catch (err) {
    console.error("Error fetching or filtering directors:", err);
  }
});

document.addEventListener("click", (e) => {
  if (!input.contains(e.target) && !suggestions.contains(e.target)) {
    suggestions.classList.add("hidden");
  }
});
