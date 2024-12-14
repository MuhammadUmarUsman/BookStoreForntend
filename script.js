$(document).ready(() => {
    let booksLoaded = 0;
    const booksPerLoad = 6;
    let allBooks = [];
    let filteredBooks = [];

    let bookContainer = $("#books-container");

    // Load books from the server
    function loadBooks() {
        $.ajax({
            url: 'http://localhost:5190/api/Books',
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                allBooks = data;
                displayBooks(allBooks);
            },
            error: function (error) {
                console.log("Error: " + error);
            }
        });
    }

    // Display books in the container
    function displayBooks(books) {
        if (books.length === 0) {
            bookContainer.html(`<p class="bc-error-p">Empty List</p>`);
            return;
        }
        bookContainer.empty();
        let booksToDisplay = books.slice(booksLoaded, booksLoaded + booksPerLoad);
        if (booksToDisplay.length === 0) {
            booksLoaded = 0;
            booksToDisplay = books.slice(booksLoaded, booksLoaded + booksPerLoad);
        }
        booksToDisplay.forEach(book => {
            let bookItem = `
                <div class="book-item">
                    <img src="${book.imageUrl}" alt="${book.title}" class="book-image">
                    <h3>${book.title}</h3>
                    <p>Author: ${book.author}</p>
                    <p>Price: ${book.price}</p>
                    <p>${book.description}</p>
                    <button class="deleteBook-button" data-book-id="${book.id}">Delete</button>
                </div>
            `;
            bookContainer.append(bookItem);
        });
        booksLoaded += booksToDisplay.length;
    }

    // Search for books
    function searchBooks(query) {
        query = query.toLowerCase();
        if (query === "") {
            displayBooks(allBooks);
        } else {
            filteredBooks = allBooks.filter(book =>
                book.title.toLowerCase().includes(query) ||
                book.author.toLowerCase().includes(query) ||
                book.description.toLowerCase().includes(query)
            );
            booksLoaded = 0;
            if (filteredBooks.length === 0) {
                bookContainer.html(`<p class="bc-error-p">No book with this name</p>`);
            } else {
                displayBooks(filteredBooks);
            }
        }
    }

    // Add a new book
    $('#add-book-form').submit((e) => {
        e.preventDefault();
        let newBook = {
            title: $('#title-to-add').val(),
            author: $('#author-to-add').val(),
            price: $('#price-to-add').val(),
            description: $('#description-to-add').val(),
            imageUrl: $('#image-to-add').val()
        };

        $.ajax({
            url: 'http://localhost:5190/api/Books',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(newBook),
            success: function (data) {
                allBooks.push(data);
                $('#title-to-add').val('');
                $('#author-to-add').val('');
                $('#price-to-add').val('');
                $('#description-to-add').val('');
                $('#image-to-add').val('');
                alert(newBook.title + " Added to books list!");

                booksLoaded = 0;
                displayBooks(allBooks);
            },
            error: function (error) {
                console.error('Error:', error);
            }
        });
    });

    // Delete a book
    bookContainer.on('click', '.deleteBook-button', function () {
        let bookId = $(this).data('book-id');
        deleteBook(bookId);
    });

    function deleteBook(bookId) {
        $.ajax({
            url: `http://localhost:5190/api/Books/${bookId}`,
            type: 'DELETE',
            success: function () {
                console.log(`Book ${bookId} deleted successfully.`);
                allBooks = allBooks.filter(book => book.id !== bookId);
                booksLoaded = 0;
                if (allBooks.length === 0) {
                    bookContainer.html(`<p class="bc-error-p">Empty List</p>`);
                } else {
                    displayBooks(allBooks);
                }
            },
            error: function (error) {
                console.error(`Error deleting book ${bookId}: ${error}`);
            }
        });
    }

    // Event Listeners
    $("#search-input").on('input', function () {
        const query = $(this).val();
        searchBooks(query);
    });

    $("#search-input").click(() => {
        $('html').animate({
            scrollTop: (bookContainer.offset().top - 200)
        }, 500);
    });

    $("#load-books").click(() => {
        displayBooks(allBooks);
    });

    // Load books on page load
    loadBooks();
});
