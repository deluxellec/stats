function createCustomScrollbar() {
  const root = document.documentElement;
  
  const scrollbar = document.createElement('div');
  scrollbar.className = 'scrollbar';

  const track = document.createElement('div');
  track.className = 'track';

  const thumb = document.createElement('div');
  thumb.className = 'thumb';

  track.appendChild(thumb);
  scrollbar.appendChild(track);
  document.body.appendChild(scrollbar);

  let isDragging = false;
  let startY = 0;
  let startScrollTop = 0;

  function updateScrollbar() {
    const scrollHeight = root.scrollHeight;
    const clientHeight = root.clientHeight;
    const maxScroll = scrollHeight - clientHeight;

    if (maxScroll <= 0) {
      scrollbar.style.display = 'none';
      return;
    }
    scrollbar.style.display = '';

    const heightRatio = clientHeight / scrollHeight;
    const thumbHeightPct = Math.max(heightRatio * 100, 10); 
    thumb.style.height = `${thumbHeightPct}%`;

    const scrollRatio = root.scrollTop / maxScroll;
    const maxThumbTranslate = 100 - (thumbHeightPct / (track.clientHeight / track.clientHeight) * 100);
    const translateY = (scrollRatio * (track.clientHeight - thumb.clientHeight));

    thumb.style.transform = `translateY(${translateY}px)`;
  }

  thumb.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    startY = e.clientY;
    startScrollTop = root.scrollTop;

    thumb.setPointerCapture(e.pointerId);
    document.body.style.userSelect = 'none';
  });

  thumb.addEventListener('pointermove', (e) => {
    if (!isDragging) return;

    const deltaY = e.clientY - startY;
    const scrollableHeight = root.scrollHeight - root.clientHeight;
    const trackScrollableHeight = track.clientHeight - thumb.clientHeight;

    if (trackScrollableHeight > 0) {
      const scrollAmount = (deltaY / trackScrollableHeight) * scrollableHeight;
      root.scrollTop = startScrollTop + scrollAmount;
    }
  });

  const stopDrag = (e) => {
    if (!isDragging) return;
    isDragging = false;
    try { thumb.releasePointerCapture(e.pointerId); } catch (_) {}
    document.body.style.userSelect = '';
  };

  thumb.addEventListener('pointerup', stopDrag);
  thumb.addEventListener('pointercancel', stopDrag);

  track.addEventListener('click', (e) => {
    if (e.target === thumb) return;
    const rect = track.getBoundingClientRect();
    const clickRatio = (e.clientY - rect.top) / rect.height;
    root.scrollTop = clickRatio * (root.scrollHeight - root.clientHeight);
  });

  window.addEventListener('scroll', updateScrollbar, { passive: true });
  window.addEventListener('resize', updateScrollbar);

  const resizeObserver = new ResizeObserver(updateScrollbar);
  resizeObserver.observe(root);

  updateScrollbar();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createCustomScrollbar);
} else {
  createCustomScrollbar();
}
