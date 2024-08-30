document.addEventListener('DOMContentLoaded', () => {
    const profileIcon = document.getElementById('profile-icon');
    const profileBox = document.getElementById('profile-box');

    profileIcon.addEventListener('click', (event) => {
        event.preventDefault();

        if (profileBox.style.display === 'block') {
            profileBox.style.display = 'none';
        } else {
            profileBox.style.display = 'block';
        }
    });

    // Close the profile box when clicking outside of it
    document.addEventListener('click', (event) => {
        if (!profileBox.contains(event.target) && event.target !== profileIcon) {
            profileBox.style.display = 'none';
        }
    });

    // Close the profile box when a link is clicked
    profileBox.addEventListener('click', (event) => {
        const target = event.target;
        if (target.tagName.toLowerCase() === 'a') {
            profileBox.style.display = 'none';
        }
    });

    document.getElementById('submit').addEventListener('click', function () {
        performSearch();
    });

    document.getElementById('searchInput').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    function performSearch() {
        const query = document.getElementById('searchInput').value;
        if (query) {
            window.location.href = `/search?q=${encodeURIComponent(query)}`;
        }
    }
});
