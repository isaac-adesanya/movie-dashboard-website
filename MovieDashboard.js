const apiKey = "499064118d29b30a3fd8fc2a23992b04"; 
$(document).ready( () => { //ensures the document is loaded before doing anything
    let currentQuery = ""; //variable to store query to be sent to API
    let currentGenre = ""; //variable to store genre to be sent to API
    let currentYear = ""; //variable to store year to be sent to API
    let currentPage = 1; //initializes current page to 1
    let totalPages = 1;

    //function to load the genre list in the navigation bar
    function loadGenre() {
        fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`)//fetches the list of all genres from the api
        .then(res => res.json())
        .then(data => {
            $("#genreSelect").append(`<option value="">All Genres</option>`);
            data.genres.forEach(g => {
                $("#genreSelect").append(`<option value="${g.id}">${g.name}</option>`);//places all the genres in a dropdown select box
            });
        });
    }

    //function to load the list of years in the navigation bar
    function loadYears() {
        const currentYear = new Date().getFullYear(); //stores the current year in a constant
    
        $("#yearSelect").append(`<option value="">Year</option>`);
        for (let y = currentYear; y >= 1900; y--) {
            $("#yearSelect").append(`<option value="${y}">${y}</option>`); //places all the years from 1900 till the current year in a dropdown select box
        }
    }
    
    loadYears(); //calls the loadYears function
    loadGenre();//calls the loadGenre function

    //click event handler for the search button
    $("#btnSearch").click(() => {
        currentQuery = $("#searchBox").val().trim(); //stores the value in the search textbox in a variable
        currentGenre = $("#genreSelect").val(); //stores the selected genre in a variable
        currentYear = $("#yearSelect").val(); //stores the selected year in a variable
        currentPage = 1; //initalizes current page to page 1

        searchMovies(); //calls the searchMovies function
    });

    //function called by the search button to search for movies
    function searchMovies() {
        let url = ""; //variable to store the fetch url 

        if (currentQuery !== "") { //if the search box is not empty, creates a url to send a request to the api based on the search value
            url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(currentQuery)}&page=${currentPage}`;
        } 
        else { //if the search box is empty, creates a url to just load the regular movie list
            url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&page=${currentPage}`;
        }

        //if a genre is selected, updates the url to filter search results based on genre
        if (currentGenre !== "") {
            url += `&with_genres=${currentGenre}`;
        }

        //if a year is selected, updates the url to filter search results based on release year as well
        if (currentYear !== "") {
            url += `&primary_release_year=${currentYear}`;
        }

        //this updates the subheading on the page based on what the user is searching for. This is to ensure 
        //that the page doesn't keep displaying "Top movies today" even when a movie is searched
        if (currentQuery !== "") {
            $("#subHeading").html(`<u>Results for "${currentQuery}"</u>`);
        }
        else if (currentGenre !== "" && currentYear !== "") {
            $("#subHeading").html(`<u>Movies from ${currentYear} (Selected Genre)</u>`);
        }
        else if (currentGenre !== "") {
            $("#subHeading").html(`<u>Movies by Genre</u>`);
        }
        else if (currentYear !== "") {
            $("#subHeading").html(`<u>Movies from ${currentYear}</u>`);
        }
        else {
            $("#subHeading").html("<u>Top Movies Today</u>"); //default subheading
        }

        //the actual fetch request to be sent to the api
        fetch(url)
            .then(res => res.json())
            .then(data => {

                $("#movieGrid").empty(); //clears out the movie grid first before filling it with new values
                $("#movieDescription").empty(); //clears out the movie description card as well
                totalPages = data.total_pages; //updates the value for the total number of pages to the total number of pages of data fetched

                if (!data.results || data.results.length === 0) {
                    $("#movieGrid").append("<p>No movies found</p>"); //if nothing was returned from the api, it alerts the user with a message in the movie grid
                    return;
                }
            
                data.results.forEach(movie => {
                    //this loop appends every single movie fetched from the api into its own movie card and places
                    //all the cards in the movie grid one by one
                    $("#movieGrid").append(`
                        <div class="movieCard" data-id="${movie.id}">
                            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                            <div class="movieCardTitle">${movie.title}</div>
                        </div>
                    `);
                });

                $("#pageNumber").text(currentPage); //updates the page number with the current page
                $("#prevPage").prop("disabled", currentPage === 1); //disables the button for previous page if the user is on page 1
                $("#nextPage").prop("disabled", currentPage === totalPages); //disables the button for next page if the user is on the last page
            });
    }

    //click event handler for the next page button
    $("#nextPage").click(() => {
        if (currentPage < totalPages) {
            currentPage++; //increments the current page value by 1 if the maximum number is pages isnt reached
            searchMovies(); //runs the searchMovies function again with the updated page number
        }
    });

    //click event handler for the previous page button
    $("#prevPage").click(() => {
        if (currentPage > 1) {
            currentPage--; //decrements the current page value by 1 if the page number is greater than 1
            searchMovies(); //runs the searchMovies function again with the updated page number
        }
    });

    //function to fetch the top 10 movies once the page is loaded
    function fetchMovies() {
        fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en-US&page=1`) //fetch request to be sent to the api
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`); //returns an error if ther fetch request fails
            }
            return response.json(); //returns the result of the fetch request in json format
        })
        .then(data=> {
            const movies = data.results.slice(0,10); //stores the first 10 movie results in a constant
            $("#movieGrid").empty(); //empties the movie grid before placing new values
            $("#movieDescription").empty(); //empties the movie description box as well
            movies.forEach(movie => {
                //the loop places all the results in their individual cards and places all the cards in the grid
                $("#movieGrid").append(`
                    <div class="movieCard" data-id="${movie.id}">
                        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                        <div class="movieCardTitle">${movie.title}</div>
                    </div>
                `);
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error); //returns an error if the fetch request fails
        });
    }

    //click event handler for the movie cards
    $(document).on("click", ".movieCard", function() {
        const movieId = $(this).data("id");
    
        // removes any previously open details cards
        $(".movie-details-container").remove();
    
        fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US`) //fetch request to fetch the details for the selected movie from the api
            .then(response => response.json())
            .then(movie => {
    
                fetch(`https://api.themoviedb.org/3/movie/${movieId}/reviews?api_key=${apiKey}&language=en-US&page=1`) //fetch request to fetch the reviews for the selected movie
                    .then(res => res.json())
                    .then(reviewsData => {
                        const reviews = reviewsData.results; //stores the results for the reviews in a constant
    
                        //creates a new section in the html for the reviews
                        let reviewsHtml = `<h3>User Reviews:</h3>`;
                        if (reviews.length === 0) { //alerts user if there are no reviews available
                            reviewsHtml += `<p>No reviews available.</p>`;
                        } 
                        else {
                            //adds a list to place the reviews in the html
                            reviewsHtml += `<ul class="reviews-list">`; 
                            reviews.forEach((r, index) => {
                                const fullContent = r.content; //places the full version of each review in a constant
                                const shortContent = fullContent.length > 300 ? fullContent.slice(0,300) + "..." : fullContent; //places the shortened version of each review in a constant
                                const needsToggle = fullContent.length > 300; //constant for when the review has more than 300 characters and needs to be shortened
    
                                reviewsHtml += `
                                    <li>
                                        <strong>${r.author}:</strong>
                                        <span class="review-short">${shortContent}</span> 
                                        <span class="review-full" style="display:none;">${fullContent}</span>
                                        ${needsToggle ? `<a href="#" class="toggle-review" data-index="${index}">Read More</a>` : ""}
                                    </li>
                                `; //default display is the shortened version but when the user clicks on "read more", the full content is displayed
                            });
                            reviewsHtml += `</ul>`;
                        }
    
                        //this adds to the html the format for the movie description box
                        $("#movieDescription").html(`
                            <div class="movie-details-container" style="display:flex; gap:20px; margin-top:10px;">
                                <div class="poster">
                                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" 
                                         alt="${movie.title}" style="width:200px; border-radius:8px;">
                                </div>
                                <div class="details">
                                    <h2>${movie.title} (${movie.release_date.slice(0,4)})</h2>
                                    <p><strong>Genres:</strong> ${movie.genres.map(g=>g.name).join(", ")}</p>
                                    <p><strong>Synopsis:</strong> ${movie.overview}</p>
                                    <p><strong>Runtime:</strong> ${movie.runtime} min</p>
                                    <p><strong>Rating:</strong> ${movie.vote_average} / 10</p>
                                    ${reviewsHtml}
                                </div>
                            </div>
                        `);

                        //this automatically scrolls to the bottom of the page where the movie description is when the movie card is clicked
                        $("html, body").animate(
                            { scrollTop: $("#movieDescription").offset().top - 50 }, //offset is to avoid leaking all the contents of the movie description to the top of the page after scrolling
                            600
                        );
    
                        // click event handler for when "read more" is clicked to toggle review long/short
                        $(".toggle-review").click(function(e) {
                            e.preventDefault(); //prevents browser default behaviour to avoid automatically jumping to the top
                            const parent = $(this).closest("li"); //finds the closest "li" element to the 'read more' link and stores it in a constant
                            parent.find(".review-short, .review-full").toggle(); //toggles between shortened review and full review
                            $(this).text($(this).text() === "Read More" ? "Collapse" : "Read More"); //toggles the link between saying "read more" and  "collapse"
                        });
    
                    });
            });
    });
    
    fetchMovies(); //calls the fetchMovies function the moment the page is loaded to automatically populate the page with the top 10 movies
})
