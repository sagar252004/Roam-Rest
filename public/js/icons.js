
  document.addEventListener("DOMContentLoaded", () => {
    const filters = document.querySelectorAll(".filter");
    const listings = document.querySelectorAll(".listing");

    filters.forEach(filter => {
      filter.addEventListener("click", () => {
        const category = filter.querySelector("p").innerText.toLowerCase();
        listings.forEach(listing => {
          if (listing.querySelector("p:last-of-type").innerText.toLowerCase().includes(category)) {
            listing.style.display = "block";
          } else {
            listing.style.display = "none";
          }
        });
      });
    });
  });

