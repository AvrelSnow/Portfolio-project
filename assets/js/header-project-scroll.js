// ============================================
// HEADER SCROLL BEHAVIOR
// Makes header static - only visible at the top of the page
// ============================================

(function () {
    const header = document.querySelector('.header');
    let scrolling = false;
    const scrollThreshold = 10; // Threshold for "at top" detection

    // Change header to static positioning
    header.style.position = 'static';
    header.style.transition = 'none'; // Remove transition since we're not animating

    // Throttled scroll handler for better performance
    window.addEventListener('scroll', function () {
        if (!scrolling) {
            window.requestAnimationFrame(function () {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

                // Header is naturally visible at top (static positioning)
                // No JavaScript action needed - it scrolls away naturally

                scrolling = false;
            });
            scrolling = true;
        }
    }, { passive: true });

    // Ensure header starts with static positioning
    window.addEventListener('load', function () {
        header.style.position = 'static';
    });
})();