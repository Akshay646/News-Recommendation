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
});
