// Handle filter from URL hash
function applyFilterFromURL() {
    const hash = window.location.hash.substring(1);
    if (hash) {
        const filterBtn = document.querySelector(`[data-filter="${hash}"]`);
        if (filterBtn) {
            filterBtn.click();
        }
    }
}

// Apply filter on page load
window.addEventListener('load', applyFilterFromURL);

// Apply filter on hash change
window.addEventListener('hashchange', applyFilterFromURL);