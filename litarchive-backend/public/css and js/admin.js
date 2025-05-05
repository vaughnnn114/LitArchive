// Load books from localStorage
const books = JSON.parse(localStorage.getItem("books")) || [];

// Populate the book selection dropdown
const bookIdSelect = document.getElementById("book-id");
books.forEach(book => {
    const option = document.createElement("option");
    option.value = book.id;
    option.textContent = book.title;
    bookIdSelect.appendChild(option);
});

// Update form fields when a book is selected
bookIdSelect.addEventListener("change", () => {
    const selectedBookId = parseInt(bookIdSelect.value);
    const book = books.find(b => b.id === selectedBookId);
    if (book) {
        document.getElementById("book-title").value = book.title;
        document.getElementById("book-image").value = book.image;
        document.getElementById("book-description").value = book.description;
        document.getElementById("book-status").value = book.status;
    }
});

// Save changes to localStorage
document.getElementById("edit-book-form").addEventListener("submit", (e) => {
    e.preventDefault();

    // Update book information
    book.title = document.getElementById("title").value;
    book.description = document.getElementById("description").value;
    book.status = document.getElementById("status").value;
    book.image = document.getElementById("image-preview").src;

    // Save updated books array to localStorage
    localStorage.setItem("books", JSON.stringify(books));

    // Confirm update and redirect
    alert("Book information updated successfully!");
    window.location.href = "aLibrary.html";
});

// Auto-select the first book when the page loads
if (books.length > 0) {
    bookIdSelect.value = books[0].id;
    bookIdSelect.dispatchEvent(new Event("change"));
}

// Function to approve a borrow request
function approveRequest(index) {
    let borrowRequests = JSON.parse(localStorage.getItem("borrowRequests")) || [];
    let approvedRequests = JSON.parse(localStorage.getItem("approvedRequests")) || [];

    const request = borrowRequests[index];
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 7); // Set return date to 1 week from now

    const approvedRequest = {
        userName: request.userName,
        bookTitle: request.bookTitle,
        dateApproved: new Date().toLocaleString(),
        returnDate: returnDate.toISOString(),
    };

    approvedRequests.push(approvedRequest);
    localStorage.setItem("approvedRequests", JSON.stringify(approvedRequests));

    // Remove the request from borrowRequests
    borrowRequests.splice(index, 1);
    localStorage.setItem("borrowRequests", JSON.stringify(borrowRequests));

    alert(`Approved request for "${request.bookTitle}" by ${request.userName}.`);
    displayBorrowRequests();
}

