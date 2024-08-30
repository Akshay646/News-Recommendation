document.addEventListener('DOMContentLoaded', () => {
    const profileIcon = document.getElementById('profile-icon');
    const profileBox = document.getElementById('profile-box');

    // Sample user status and user name (replace with actual logic)
    const isSignedIn = false; // Change this to `true` if the user is signed in
    const userName = 'John Doe'; // Replace with the actual user's name

    profileIcon.addEventListener('click', (event) => {
        event.preventDefault();

        if (profileBox.style.display === 'block') {
            profileBox.style.display = 'none';
        } else {
            profileBox.style.display = 'block';
            profileBox.innerHTML = isSignedIn
                ? `<h2>Hello, ${userName}!</h2>
                   <a href="/profile">Profile</a>
                   <a href="/logout" class="sign-out">Sign Out</a>`
                : `<h2>Welcome!</h2>
                   <a href="/login">Sign In</a>
                   <a href="/register">Sign Up</a>`;
        }
    });

    
    // Close the profile box when clicking outside of it
    document.addEventListener('click', function () {
        if (isProfileBoxOpen) {
            profileBox.style.display = 'none';
            isProfileBoxOpen = false;
        }
    });

    // Close the profile box when a link is clicked
    profileBox.addEventListener('click', function (event) {
        const target = event.target;
        if (target.tagName.toLowerCase() === 'a') {
            profileBox.style.display = 'none';
            isProfileBoxOpen = false;
        }
    });
});
