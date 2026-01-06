document.addEventListener('DOMContentLoaded', () => {
    // Navigation Logic
    const landingSection = document.querySelector('.landing-section');
    const visualizerContainer = document.querySelector('.visualizer-container');
    const getStartedBtn = document.querySelector('#get-started-btn');
    const navLogo = document.querySelector('.logo');

    // Mobile Nav Toggle
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    function showVisualizer() {
        if (landingSection) landingSection.style.display = 'none';
        if (visualizerContainer) visualizerContainer.style.display = 'flex';
        // Animate Navbar and Show Learn Button
        const navbar = document.querySelector('.navbar');
        if (navbar) navbar.classList.add('compact');

        const learnBtn = document.getElementById('learn-nav-item');
        if (learnBtn) {
            learnBtn.style.display = 'block';
            // Small delay to ensure display:block works before animation
            setTimeout(() => {
                learnBtn.classList.add('fade-in-slide');
                learnBtn.style.opacity = '1';
            }, 100);
        }
    }

    function showHome() {
        visualizerContainer.style.display = 'none';
        landingSection.style.display = 'flex';
    }

    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'topics.html';
        });
    }

    if (navLogo) {
        navLogo.addEventListener('click', (e) => {
            e.preventDefault();
            showHome();
        });
    }

    // Check for URL parameters to load specific topic
    const urlParams = new URLSearchParams(window.location.search);
    const currentTopic = urlParams.get('topic');

    if (currentTopic) {
        showVisualizer();
        // Here you would typically load the dynamic content (Theory, Code) based on 'currentTopic'
        // For now, we update the title to reflect the topic
        const topicTitle = currentTopic.charAt(0).toUpperCase() + currentTopic.slice(1);
        document.title = `${topicTitle} - DSA Visualizer`;

        // Example: Update the Theory header (Optional placeholder logic)
        const theoryHeader = document.querySelector('#theory h2');
        if (theoryHeader) theoryHeader.textContent = `${topicTitle} Visualization`;
    }

    // Tab Switching Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked button
            btn.classList.add('active');

            // Show corresponding content
            const tabId = btn.getAttribute('data-tab');
            const content = document.getElementById(tabId);
            if (content) {
                content.classList.add('active');
            }
        });
    });

    // Auto-trigger for topic pages
    if (document.body.classList.contains('visualizer-page')) {
        showVisualizer();
    }
});
