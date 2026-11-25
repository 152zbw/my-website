(() => {
    const articleId = Number(document.currentScript.dataset.articleId) || null;
    const storageKey = 'site-analytics-browser-id';

    function getBrowserId() {
        try {
            let id = localStorage.getItem(storageKey);
            if (!id) {
                id = crypto.randomUUID();
                localStorage.setItem(storageKey, id);
            }
            return id;
        } catch {
            return null;
        }
    }

    async function trackView() {
        try {
            const response = await fetch('/api/analytics/views', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ articleId, browserId: articleId === null ? null : getBrowserId() }),
                keepalive: true
            });
            if (articleId === null || !response.ok) return;

            const { readers } = await response.json();
            const count = document.getElementById('articleReaderCount');
            if (count) {
                const english = window.SiteI18n?.isEnglish();
                if (english) {
                    count.querySelector('[data-reader-label]').textContent = 'Readers';
                    count.title = 'One reader per browser for this article';
                }
                count.querySelector('[data-reader-number]').textContent = readers.toLocaleString(english ? 'en' : 'zh-CN');
                count.hidden = false;
            }
        } catch {
            // Page content remains available when analytics is unavailable.
        }
    }

    if (document.visibilityState === 'visible') {
        trackView();
    } else {
        function trackWhenVisible() {
            if (document.visibilityState !== 'visible') return;
            document.removeEventListener('visibilitychange', trackWhenVisible);
            trackView();
        }
        document.addEventListener('visibilitychange', trackWhenVisible);
    }
})();
