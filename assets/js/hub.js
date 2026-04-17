function filterApps(query) {
    const normalized = query.trim().toLowerCase();
    const cards = document.querySelectorAll('.app-card');
    let visibleCount = 0;

    cards.forEach(card => {
        const appName = (card.dataset.appName || '').toLowerCase();
        const matches = normalized === '' || appName.includes(normalized);
        card.hidden = !matches;
        if (matches) {
            visibleCount += 1;
        }
    });

    const noResults = document.getElementById('no-results');
    noResults.hidden = visibleCount !== 0;
}
