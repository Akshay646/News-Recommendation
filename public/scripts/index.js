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

    // Modal client side code
    const newsItems = document.querySelectorAll('.news-item');
    const modal = document.getElementById('newsModal');
    const span = document.getElementsByClassName('close')[0];
    const aside = document.querySelector('aside');
    const loader = document.createElement('div');
    loader.className = 'loader'; // Ensure you have corresponding CSS for this class

    newsItems.forEach(item => {
        item.addEventListener('click', async function (event) {
            // Prevent modal from opening if the click is on a link
            if (event.target.tagName === 'A' || event.target.closest('a')) {
                return;
            }

            // Set the modal content
            const title = this.dataset.title;
            const description = this.dataset.description;
            const creator = this.dataset.creator;
            const link = this.dataset.link;
            document.getElementById('modalTitle').innerHTML = `<a href="${link}" target="_blank">${title}</a>`;
            document.getElementById('modalCreator').innerText = `By: ${creator}`;
            document.getElementById('modalPubDate').innerText = `Published on: ${this.dataset.pubdate}`;
            document.getElementById('modalImage').src = this.dataset.image;
            document.getElementById('modalDescription').innerText = description;

            modal.style.display = 'block';

            // Show the loader
            aside.innerHTML = '<h2>Recommendations</h2>'; // Ensure the header is always present
            aside.appendChild(loader);

            try {
                const response = await fetch('/recommendation', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: title,
                        description: description,
                        creator: creator
                    })
                });

                if (response.ok) {
                    const recommendations = await response.json();

                    // Update the DOM to display the recommendations
                    const recommendationsHtml = recommendations.map(recommendation => `
                        <section class="recommendation" data-id="${recommendation._id}">
                            <a href="${recommendation.link}" target="_blank">
                                <img src="${recommendation.image_url || 'default-image-path.jpg'}" alt="Recommendation Image">
                            </a>
                            <div class="recommendation-content">
                                <h3><a href="${recommendation.link}" target="_blank">${recommendation.title}</a></h3>
                                <p>${recommendation.description}</p>
                                ${recommendation.similarity_score ? `<p><strong>Similarity Score:</strong> ${recommendation.similarity_score}</p>` : ''}
                            </div>
                        </section>
                    `).join('');

                    aside.innerHTML = '<h2>Recommendations</h2>' + recommendationsHtml;
                } else {
                    console.error('Failed to fetch recommendations');
                    aside.innerHTML = '<h2>Recommendations</h2><p>Failed to load recommendations</p>';
                }
            } catch (error) {
                console.error('Error fetching recommendations', error);
                aside.innerHTML = '<h2>Recommendations</h2><p>Error loading recommendations</p>';
            } finally {
                // Hide the loader
                if (aside.contains(loader)) {
                    aside.removeChild(loader);
                }
            }
        });
    });

    span.onclick = function () {
        modal.style.display = 'none';
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
});
