//Smooth scrooling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Lazy loading for potential future images
document.addEventListener("DOMContentLoaded", function () {
    if ('loading' in HTMLImageElement.prototype) {
        // Native lazy loading is supported
        const lazyImages = document.querySelectorAll("img[loading='lazy']");
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
        });
    } else {
        // Fallback for browsers without native lazy loading
        const lazyLoadInstance = new LazyLoad({
            elements_selector: ".lazy"
        });
    }

    // Service worker registration for PWA capabilities
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('ServiceWorker registration successful');
            }).catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }
});

// Highlight active nav link
const navLinks = document.querySelectorAll('.nav-list li a');
navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        // Prevent default if using # links
        if (this.getAttribute('href').startsWith('#')) {
            e.preventDefault();
        }
    });
});

// Optional: Smooth scroll for anchor links
const anchorLinks = document.querySelectorAll('a[href^="#"]');
anchorLinks.forEach(link => {
    link.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});