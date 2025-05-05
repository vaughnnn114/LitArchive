function applyDarkMode() {
    const darkMode = localStorage.getItem("darkMode");
    if (darkMode === "enabled") {
        document.body.classList.add("dark");
        const checkbox = document.getElementById("checkbox");
        if (checkbox) checkbox.checked = true;
        if (typeof changeTextColors === 'function') changeTextColors(true);
    } else {
        document.body.classList.remove("dark");
        const checkbox = document.getElementById("checkbox");
        if (checkbox) checkbox.checked = false;
        if (typeof changeTextColors === 'function') changeTextColors(false);
    }
}

window.addEventListener("DOMContentLoaded", function() {
    applyDarkMode();
    // Add event listener for the toggle checkbox
    const checkbox = document.getElementById("checkbox");
    if (checkbox) {
        checkbox.addEventListener("change", toggleDarkMode);
    }
});

function toggleDarkMode() {
    const enabled = !document.body.classList.contains("dark");
    if (enabled) {
        document.body.classList.add("dark");
        localStorage.setItem("darkMode", "enabled");
    } else {
        document.body.classList.remove("dark");
        localStorage.setItem("darkMode", "disabled");
    }
    if (typeof changeTextColors === 'function') changeTextColors(enabled);
}