import product from "../../Dynamic API/productAdd";
 

// // Add the debounce function
// function debounce(func, timeout = 500) {
//   let timer;
//   return (...args) => {
//     clearTimeout(timer);
//     timer = setTimeout(() => {
//       func.apply(this, args);
//     }, timeout);
//   };
// }

// window.onload = function () {
//   const searchInput = document.getElementById("browser-input");
//   const searchResultList = document.getElementById("search-result-list");

//   // Add a debounce function to the `input` event listener
//   searchInput.addEventListener(
//     "input",
//     debounce(async () => {
//       // Get the value of the search input field
//       const query = searchInput.value.trim();

//       // If the query is empty, do nothing
//       if (query === "") {
//         return;
//       }

//       // Fetch the suggestions from the database
//       const suggestions = await product.find({
//         title: {
//           $regex: query,
//           $options: "i",
//         },
//       });

//       // If there are no suggestions, clear the search results list
//       if (suggestions.length === 0) {
//         searchResultList.innerHTML = "";
//         return;
//       }

//       // Add the suggestions to the search results list
//       for (const suggestion of suggestions) {
//         const searchResultLi = document.createElement("li");
//         searchResultLi.textContent = suggestion.title;
//         searchResultList.appendChild(searchResultLi);
//       }
//     }, 500)
//   );
// };

// import product from "../../Dynamic API/productAdd";

window.onload = function () {
  const searchInput = document.getElementById("browser-input");
  const searchResultList = document.getElementById("search-result-list");

  // Add a debounce function to the `input` event listener
  searchInput.addEventListener(
    "input",
    debounce(async () => {
      // Get the value of the search input field
      const query = searchInput.value.trim();

      // If the query is empty, do nothing
      if (query === "") {
        return;
      }

      // Fetch the suggestions from the database
      const suggestions = await product.find({
        title: {
          $regex: query,
          $options: "i",
        },
      });

      // If there are no suggestions, clear the search results list
      if (suggestions.length === 0) {
        searchResultList.innerHTML = "";
        return;
      }

      // Add the suggestions to the search results list
      for (const suggestion of suggestions) {
        const searchResultLi = document.createElement("li");
        searchResultLi.textContent = suggestion.title;
        searchResultList.appendChild(searchResultLi);
      }
    }, 500)
  );
};
