const video = document.getElementById('trailer');
video.play().catch(() => { /* Native controls allow playback if autoplay is blocked. */ });
window.addEventListener('keydown', event => {
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    if (event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (!event.repeat) location.assign('index.html');
    } else if (event.code === 'Space' && !['BUTTON', 'INPUT', 'A'].includes(event.target.tagName)) {
        event.preventDefault();
        if (video.paused) video.play().catch(() => {});
        else video.pause();
    }
});
