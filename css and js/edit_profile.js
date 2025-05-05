// Select profile picture input and profile image element
const profilePicInput = document.getElementById('profilePicInput');
const profilePic = document.getElementById('profilePic'); // Image element for preview

// Listen for changes to the file input
profilePicInput.addEventListener('change', () => {
    const file = profilePicInput.files[0]; // Get the selected file
    if (file) {
        const reader = new FileReader(); // Create a new FileReader
        reader.onload = (e) => {
            const imageData = e.target.result; // Get the image data as a base64 string
            profilePic.src = imageData; // Show the image in the preview

            // Save the image data to localStorage
            localStorage.setItem('profilePicture', imageData);
            console.log("Profile picture saved to localStorage:", imageData); // Debugging line
        };
        reader.readAsDataURL(file); // Read the file as a base64-encoded URL
    }
});

// Handle form submission
document.getElementById('editProfileForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value;

    // Save name and email in localStorage
    localStorage.setItem('profileName', name);

    alert(`Profile updated!\nName: ${name}`);

    // Redirect to the main page (or close the form)
    window.location.href = 'aLibrary.html';
});

// Cancel edit and go back to the main page
function cancelEdit() {
    window.location.href = 'aLibrary.html';
}
