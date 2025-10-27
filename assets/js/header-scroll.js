// ============================================
// HEADER SCROLL BEHAVIOR
// Hides header on scroll down, shows on scroll up
// ============================================

(function () {
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    let scrolling = false;
    const scrollThreshold = 10; // Minimum scroll distance to trigger hide/show
    const headerHeight = header.offsetHeight;

    // Add transition CSS for smooth animation
    header.style.transition = 'transform 0.3s ease-in-out';

    // Throttled scroll handler for better performance
    window.addEventListener('scroll', function () {
        if (!scrolling) {
            window.requestAnimationFrame(function () {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

                // Prevent negative scrolling issues on mobile
                if (scrollTop < 0) {
                    scrolling = false;
                    return;
                }

                // Calculate scroll direction and distance
                const scrollDifference = Math.abs(scrollTop - lastScrollTop);

                // Only trigger if scrolled past threshold
                if (scrollDifference > scrollThreshold) {
                    if (scrollTop > lastScrollTop && scrollTop > headerHeight) {
                        // Scrolling DOWN - hide header
                        header.style.transform = `translateY(-${headerHeight}px)`;
                    } else {
                        // Scrolling UP - show header
                        header.style.transform = 'translateY(0)';
                    }

                    lastScrollTop = scrollTop;
                }

                scrolling = false;
            });
            scrolling = true;
        }
    }, { passive: true });

    // Reset header position on page load
    window.addEventListener('load', function () {
        header.style.transform = 'translateY(0)';
    });
})();