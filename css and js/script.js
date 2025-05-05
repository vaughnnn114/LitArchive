window.addEventListener('load', () => {
    const countDisplay = document.getElementById('available-count');
    countDisplay.style.display = 'none'; // Hide the count by default

    // Retrieve the profile picture from localStorage
    const savedProfilePic = localStorage.getItem('profilePicture');
    const mainProfilePic = document.getElementById('mainProfilePic'); // Profile picture on the main page
    const dropdownProfilePic = document.getElementById('dropdownProfilePic'); // Profile picture in the dropdown
    const dropdownName = document.getElementById('dropdownName'); // Profile name in the dropdown

    // Check if profile picture is saved
    if (savedProfilePic) {
        mainProfilePic.src = savedProfilePic;
        dropdownProfilePic.src = savedProfilePic;
    }

    // Check if profile name is saved
    const savedName = localStorage.getItem('profileName');
    if (savedName) {
        dropdownName.textContent = savedName;
    }
});

// Function to filter books by genre and category
function filterBooksByCategory(genre, category) {
    console.log(`Filtering books by genre: ${genre}, category: ${category}`); // Debugging line

    const allBooks = document.querySelectorAll(".book-item");
    let availableCount = 0;

    allBooks.forEach((book) => {
        const bookGenre = book.getAttribute('data-genre'); // Genre stored in the book's data-attribute
        const bookCategory = book.getAttribute('data-category'); // Category stored in the book's data-attribute

        // Check if the book matches the genre and category
        const matchesGenre = genre === "all" || bookGenre === genre;
        const matchesCategory = category === "all" || bookCategory === category;

        if (matchesGenre && matchesCategory) {
            book.style.display = "block"; // Show the book
            availableCount++; // Increase count for visible books
        } else {
            book.style.display = "none"; // Hide the book
        }
    });

    // Update the available books count display
    const countDisplay = document.getElementById('available-count');
    if (genre === "all" && category === "all") {
        countDisplay.style.display = "none"; // Hide count for "All Books"
    } else {
        countDisplay.style.display = "block";
        countDisplay.textContent = `Available Books: ${availableCount}`;
    }
}

// Function to search books by title and category
function search_books() {
    let input = document.getElementById('searchbar').value.toLowerCase();
    let items = document.getElementsByClassName('book-item');
    const selectedCategory = document.getElementById('categoryFilter').value; // Get selected category filter

    for (let i = 0; i < items.length; i++) {
        let title = items[i].getElementsByClassName('book-title')[0].textContent.toLowerCase();
        let category = items[i].getAttribute('data-category'); // Category stored in the book's data-attribute

        // Check if the book title includes the search input and matches the selected category
        if ((title.includes(input) || input === "") && (selectedCategory === "all" || category === selectedCategory)) {
            items[i].style.display = "flex";
        } else {
            items[i].style.display = "none";
        }
    }
}

// Function to fetch books from backend
function fetchBooks() {
    return fetch('http://192.168.1.16:3001/api/books')
        .then(res => res.json())
        .catch(() => []);
}

// Function to display books
function displayBooks(genre = "all", category = "all") {
    fetchBooks().then(books => {
        const container = document.querySelector('.book-container');
        if (!container) return;
        container.innerHTML = '';
        // Filter books by genre and category
        const filteredBooks = books.filter(book => {
            const matchesGenre = genre === "all" || (book.genre && book.genre.toLowerCase() === genre.toLowerCase());
            const matchesCategory = category === "all" || (book.category && book.category.toLowerCase() === category.toLowerCase());
            return matchesGenre && matchesCategory;
        });
        if (filteredBooks.length === 0) {
            container.innerHTML = "<p>No books found for the selected filters.</p>";
            return;
        }
        filteredBooks.forEach(book => {
            const bookElement = document.createElement('div');
            bookElement.classList.add('book-item');
            bookElement.setAttribute('data-genre', book.genre || '');
            bookElement.setAttribute('data-category', book.category || '');
            bookElement.innerHTML = `
                <img src="${book.image}" alt="${book.title}" class="book-image">
                <div class="book-details">
                    <h3 class="book-title">${book.title}</h3>
                    <button class="book-status ${book.status && book.status.toLowerCase()}" onclick="showBookDetails('${book.title.replace(/'/g, "\\'")}')">
                        ${book.status}
                    </button>
                </div>
            `;
            container.appendChild(bookElement);
        });
    });
}

// Function to show book details in a popup
function showBookDetails(bookTitle) {
    fetchBooks().then(books => {
        const book = books.find(b => b.title === bookTitle);
        if (!book) {
            alert("Book not found.");
            return;
        }
        // Populate the modal with book details
        document.getElementById('modal-book-title').textContent = book.title;
        document.getElementById('modal-book-image').src = book.image;
        document.getElementById('modal-book-description').textContent = book.description;
        document.getElementById('modal-book-status').textContent = book.status;
        document.getElementById('modal-book-copies').textContent = `Copies: ${book.copies}`;
        // Show return date if borrowed by current user
        const currentUserRaw = localStorage.getItem("currentUser");
        let currentUser;
        try {
            currentUser = JSON.parse(currentUserRaw);
        } catch (e) {
            currentUser = null;
        }
        let borrowRequests = JSON.parse(localStorage.getItem("borrowRequests")) || [];
        let userBorrow = null;
        if (currentUser) {
            userBorrow = borrowRequests.find(r => r.bookTitle === book.title && (r.userName === currentUser.name || r.userName === currentUser.username));
        }
        const statusElem = document.getElementById('modal-book-status');
        if (userBorrow && userBorrow.returnDate) {
            statusElem.textContent = `Borrowed, return by ${userBorrow.returnDate}`;
        }
        document.getElementById('book-modal').style.display = 'block';
    });
}

// Function to close the book modal
function closeBookModal() {
    document.getElementById('book-modal').style.display = 'none';
}

// Function to filter books by category and genre
function filterBooks() {
    const genre = document.getElementById('genreFilter')?.value || 'all';
    const category = document.getElementById('categoryFilter')?.value || 'all';
    displayBooks(genre, category);
}

// Event listener for DOMContentLoaded
// Only add event listeners if elements exist

document.addEventListener("DOMContentLoaded", () => {
    displayBooks(); // Display all books on load
    const genreFilter = document.getElementById('genreFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    if (genreFilter) genreFilter.addEventListener('change', filterBooks);
    if (categoryFilter) categoryFilter.addEventListener('change', filterBooks);
});

function logout() {
    localStorage.removeItem("currentUser");
    alert("You have been logged out.");
    window.location.href = "loginpage.html";
}

function scrollBooks(direction) {
    const container = document.querySelector('.book-container');
    const scrollAmount = 300; // Adjust as needed
    container.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
}

// Function to update a book's details
function updateBook(bookId) {
    const books = loadBooks();
    const book = books.find(b => b.id === bookId);
    if (book) {
        // Set values in the form or modal to edit
        document.getElementById('book-title').value = book.title;
        document.getElementById('book-description').value = book.description;
        document.getElementById('book-stock').value = book.stock;
        // More code for the update form/modal can go here
    }
}

// Close the modal if the user clicks outside of the modal content
window.addEventListener("click", function (event) {
    const modal = document.getElementById("book-modal");
    const modalContent = document.querySelector(".modal-content");

    if (event.target === modal && !modalContent.contains(event.target)) {
        closeBookModal();
    }
});

// Example: Store user information in localStorage after login
function loginUser() {
    const user = {
        name: "John Doe",
        profilePic: "./images/john_doe.jpg", // User's profile picture
        email: "johndoe@example.com"
    };
    
    // Store the user information in localStorage
    localStorage.setItem("user", JSON.stringify(user));
    
    // Redirect to the main page after login
    window.location.href = "library.html"; // or wherever you want to redirect
}

function login(username, password) {
    const USers = JSON.parse(localStorage.getItem("USers")) || [];

    // Check if the user exists
    const user = USers.find((u) => u.username === username && u.password === password);

    if (user) {
        // Set the current logged-in user
        localStorage.setItem("currentUser", JSON.stringify(user));
        alert("Login successful!");
        window.location.href = "library.html"; // Redirect to the main page
    } else {
        alert("Invalid username or password.");
    }
}

const sampleUsers = [
    {
        username: "user1",
        password: "password1",
        name: "Alice",
        profilePic: "./images/user1.png",
    },
    {
        username: "user2",
        password: "password2",
        name: "Bob",
        profilePic: "./images/user2.png",
    },
];

// Store sample users if not already present
if (!localStorage.getItem("USers")) {
    localStorage.setItem("USers", JSON.stringify(sampleUSers));
}

// Show the borrow confirmation modal
function showBorrowConfirmModal(bookTitle) {
    const modal = document.getElementById('borrow-confirm-modal');
    const titleElem = document.getElementById('borrow-confirm-title');
    const dateInput = document.getElementById('return-date');
    // Set book title in modal
    titleElem.textContent = `Do you want to borrow "${bookTitle}"?`;
    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = '';
    dateInput.min = today;
    modal.classList.add('active');
    // Store book title for confirmation
    modal.dataset.bookTitle = bookTitle;
    // Attach event listeners every time modal is shown
    const confirmBtn = document.getElementById('confirm-borrow-btn');
    const cancelBtn = document.getElementById('cancel-borrow-btn');
    if (confirmBtn) {
        confirmBtn.onclick = function() {
            const bookTitle = modal.dataset.bookTitle;
            const returnDate = dateInput.value;
            if (!returnDate) {
                alert('Please select a return date.');
                return;
            }
            // Get user
            const currentUserRaw = localStorage.getItem("currentUser");
            let currentUser;
            try {
                currentUser = JSON.parse(currentUserRaw);
            } catch (e) {
                alert("User data corrupted. Please log in again.");
                window.location.href = "loginpage.html";
                return;
            }
            // Save borrow info (localStorage fallback)
            let borrowRequests = JSON.parse(localStorage.getItem("borrowRequests")) || [];
            borrowRequests.push({
                userName: currentUser.name || currentUser.username || "User",
                bookTitle: bookTitle,
                date: new Date().toLocaleString(),
                returnDate: returnDate,
                status: "Borrowed"
            });
            localStorage.setItem("borrowRequests", JSON.stringify(borrowRequests));
            hideBorrowConfirmModal();
            closeBookModal();
            alert(`Book borrowed, return by ${returnDate}.`);
        };
    }
    if (cancelBtn) {
        cancelBtn.onclick = function() {
            hideBorrowConfirmModal();
        };
    }
}

// Hide the borrow confirmation modal
function hideBorrowConfirmModal() {
    const modal = document.getElementById('borrow-confirm-modal');
    modal.classList.remove('active');
}

// Improved borrowBook function: now opens confirmation modal
function borrowBook() {
    const titleElem = document.getElementById("modal-book-title");
    if (!titleElem) {
        alert("Modal book title element not found!");
        return;
    }
    const title = titleElem.textContent;
    // Check user login
    const currentUserRaw = localStorage.getItem("currentUser");
    if (!currentUserRaw) {
        alert("You need to log in to borrow a book.");
        window.location.href = "loginpage.html";
        return;
    }
    let currentUser;
    try {
        currentUser = JSON.parse(currentUserRaw);
    } catch (e) {
        alert("User data corrupted. Please log in again.");
        window.location.href = "loginpage.html";
        return;
    }
    // Open confirmation modal
    showBorrowConfirmModal(title);
}
window.borrowBook = borrowBook;

// Function to check notifications and display the return timer
function checkNotifications() {
    const user = JSON.parse(localStorage.getItem("USers"));
    const approvedRequests = JSON.parse(localStorage.getItem("approvedRequests")) || [];

    if (!user) {
        console.error("User data not found.");
        return;
    }

    // Find the approved request for the current user
    const approved = approvedRequests.find((req) => req.userName === user.name);

    if (approved) {
        alert(`Your request to borrow "${approved.bookTitle}" has been approved. Please return it by ${approved.returnDate}.`);
        displayReturnTimer(approved.returnDate);
    } else {
        document.getElementById("return-timer").textContent = "No active borrow requests.";
    }
}

// Function to display the return timer
function displayReturnTimer(returnDate) {
    const timerElement = document.getElementById("return-timer");

    if (!timerElement) {
        console.error("Return timer element not found.");
        return;
    }

    // Parse the return date
    const returnDateTime = new Date(returnDate).getTime();

    // Check if returnDateTime is valid
    if (isNaN(returnDateTime)) {
        console.error("Invalid return date:", returnDate);
        timerElement.textContent = "Error: Invalid return date.";
        return;
    }

    // Update the timer every second
    const timerInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = returnDateTime - now;

        // If the return date is in the past, show overdue message
        if (distance <= 0) {
            clearInterval(timerInterval);
            timerElement.textContent = "Book return overdue!";
            alert("Your borrowed book is overdue. Please return it as soon as possible.");
            return;
        }

        // Calculate days, hours, minutes, and seconds
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the timer
        timerElement.textContent = `Time left to return: ${days}d ${hours}h ${minutes}m ${seconds}s`;
    }, 1000);
}

// Call checkNotifications when the page loads
document.addEventListener("DOMContentLoaded", checkNotifications);

function openBooksPopup() {
    document.getElementById("books-popup").style.display = "block";
    displayAvailableBooks();
}

function closeBooksPopup() {
    document.getElementById("books-popup").style.display = "none";
}

function displayAvailableBooks() {
    const availableBooksList = document.getElementById("available-books-list");
    const books = JSON.parse(localStorage.getItem("books")) || [];

    // Clear existing list
    availableBooksList.innerHTML = "";

    // Filter books based on availability
    const availableBooks = books.filter(book => book.status.toLowerCase() === "available");

    if (availableBooks.length === 0) {
        availableBooksList.innerHTML = "<p>No available books.</p>";
        return;
    }

    // Add books to the list
    availableBooks.forEach(book => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <div>
                <img src="${book.image}" alt="${book.title}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
                <span>${book.title}</span>
            </div>
            <button class="borrow-button" onclick="borrowBookFromPopup('${book.title}', '${book.image}')">Borrow</button>
        `;
        availableBooksList.appendChild(listItem);
    });
}

function filterAvailableBooks() {
    const searchTerm = document.getElementById("popup-search-bar").value.toLowerCase();
    const books = JSON.parse(localStorage.getItem("books")) || [];
    const availableBooks = books.filter(book => book.status.toLowerCase() === "available" && book.title.toLowerCase().includes(searchTerm));

    const availableBooksList = document.getElementById("available-books-list");
    availableBooksList.innerHTML = "";

    if (availableBooks.length === 0) {
        availableBooksList.innerHTML = "<p>No matching books found.</p>";
        return;
    }

    availableBooks.forEach(book => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <div>
                <img src="${book.image}" alt="${book.title}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
                <span>${book.title}</span>
            </div>
            <button class="borrow-button" onclick="borrowBookFromPopup('${book.title}', '${book.image}')">Borrow</button>
        `;
        availableBooksList.appendChild(listItem);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    displayBorrowRequests();
});

function displayBorrowRequests() {
    const borrowRequests = JSON.parse(localStorage.getItem("borrowRequests")) || [];
    const requestsContainer = document.getElementById("requests-container");

    // Clear the container
    requestsContainer.innerHTML = "";

    if (borrowRequests.length === 0) {
        requestsContainer.innerHTML = "<p>No pending borrow requests.</p>";
        return;
    }

    // Create and display the requests
    borrowRequests.forEach((request, index) => {
        const requestItem = document.createElement("div");
        requestItem.classList.add("request-item");
        requestItem.innerHTML = `
            <img src="${request.bookImage}" alt="${request.bookTitle}" class="request-book-image">
            <div class="request-details">
                <h3>${request.bookTitle}</h3>
                <p>Requested by: ${request.userName}</p>
                <p>Status: ${request.status}</p>
            </div>
            <div class="request-actions">
                <button onclick="approveRequest(${index})">Approve</button>
                <button onclick="rejectRequest(${index})">Reject</button>
            </div>
        `;
        requestsContainer.appendChild(requestItem);
    });
}

function approveRequest(index) {
    const borrowRequests = JSON.parse(localStorage.getItem("borrowRequests")) || [];
    borrowRequests[index].status = "Approved";
    localStorage.setItem("borrowRequests", JSON.stringify(borrowRequests));
    displayBorrowRequests();
    alert(`Request for "${borrowRequests[index].bookTitle}" approved.`);
}

function rejectRequest(index) {
    const borrowRequests = JSON.parse(localStorage.getItem("borrowRequests")) || [];
    borrowRequests[index].status = "Rejected";
    localStorage.setItem("borrowRequests", JSON.stringify(borrowRequests));
    displayBorrowRequests();
    alert(`Request for "${borrowRequests[index].bookTitle}" rejected.`);
}

// Ensure changeTextColors is defined and accessible
function changeTextColors() {
    // Example: document.body.style.color = 'white';
}

// Add comments for missing images
// Make sure 'default-book.png' and 'default-profile.png' exist in /images/ directory
// If you still get 404, update the image paths or add the images to the correct folder.