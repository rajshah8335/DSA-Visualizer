document.addEventListener('DOMContentLoaded', () => {
    // Mobile Nav Toggle
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    const searchInput = document.getElementById('search-input');
    const topicsGrid = document.getElementById('topics-grid');
    const topicCards = topicsGrid.getElementsByClassName('topic-card');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();

            Array.from(topicCards).forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                // Also search description if you want
                // const desc = card.querySelector('p').textContent.toLowerCase();

                if (title.includes(searchTerm)) {
                    card.style.display = 'flex';
                    // Optional: fade in animation could go here
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
});
