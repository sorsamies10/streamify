document.addEventListener('DOMContentLoaded', () => {
    const urlForm = document.getElementById('url-form');
    const urlInput = document.getElementById('video-url-input');
    const mediaWrapper = document.getElementById('media-wrapper');
    const videoTitle = document.getElementById('video-title');
    const videoUrlDisplay = document.getElementById('video-url-display');
    const copyUrlBtn = document.getElementById('copy-url-btn');
    const videoAuthor = document.getElementById('video-author');
    const videoChannelInfo = document.getElementById('video-channel-info');
    const avatarImg = document.getElementById('channel-avatar-img');
    const avatarPlaceholder = document.getElementById('channel-avatar-placeholder');

    function parseVideoUrl(url) {
        let youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        if (youtubeMatch) {
            return {
                type: 'youtube',
                id: youtubeMatch[1],
                src: `https://www.youtube-nocookie.com/embed/${youtubeMatch[1]}?autoplay=1`
            };
        }

        let vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch) {
            return {
                type: 'vimeo',
                id: vimeoMatch[1],
                src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`
            };
        }

        let dailymotionMatch = url.match(/dailymotion\.com\/video\/([kK][a-zA-Z0-9]+)/);
        if (dailymotionMatch) {
            return {
                type: 'dailymotion',
                id: dailymotionMatch[1],
                src: `https://www.dailymotion.com/embed/video/${dailymotionMatch[1]}?autoplay=1`
            };
        }

        return {
            type: 'direct',
            src: url
        };
    }

    async function fetchYouTubeMeta(videoUrl) {
        try {
            const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(videoUrl)}`);
            if (res.ok) {
                const data = await res.json();
                if (data && !data.error) {
                    return {
                        title: data.title || "YouTube-video",
                        author: data.author_name || "YouTube-kanava"
                    };
                }
            }
        } catch (e) {
            console.log("Meta-haku epäonnistui:", e);
        }
        return null;
    }

    function loadVideo(url) {
        const videoData = parseVideoUrl(url);
        mediaWrapper.innerHTML = '';

        videoUrlDisplay.textContent = url;

        videoTitle.textContent = "Ladataan tietoja...";
        videoAuthor.textContent = videoData.type === 'youtube' ? 'YouTube-kanava' : 'Suora videolähde';
        videoChannelInfo.textContent = videoData.type.toUpperCase() + " -lähde";

        avatarImg.style.display = 'none';
        avatarPlaceholder.style.display = 'flex';

        if (videoData.type === 'direct') {
            const videoElem = document.createElement('video');
            videoElem.controls = true;
            videoElem.autoplay = true;
            
            const source = document.createElement('source');
            source.src = videoData.src;
            videoElem.appendChild(source);
            
            videoElem.onerror = () => {
                mediaWrapper.innerHTML = `
                    <div class="placeholder">
                        <i class="fa-solid fa-triangle-exclamation" style="color:#ff4444; font-size:48px;"></i>
                        <p>Videon lataus epäonnistui. Tarkista osoite tai kokeile toista linkkiä.</p>
                    </div>`;
            };

            mediaWrapper.appendChild(videoElem);
        } else {
            const iframe = document.createElement('iframe');
            iframe.src = videoData.src;
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
            iframe.allowFullscreen = true;
            mediaWrapper.appendChild(iframe);
        }

        if (videoData.type === 'youtube') {
            fetchYouTubeMeta(url).then(meta => {
                if (meta) {
                    if (meta.title) videoTitle.textContent = meta.title;
                    if (meta.author) videoAuthor.textContent = meta.author;
                } else {
                    videoTitle.textContent = "YouTube-video";
                }
            });
        } else {
            videoTitle.textContent = "Verkkovideo";
        }
    }

    urlForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const url = urlInput.value.trim();
        if (url) {
            loadVideo(url);
        }
    });

    copyUrlBtn.addEventListener('click', () => {
        const urlText = videoUrlDisplay.textContent;
        if (urlText && urlText !== 'Ei valittua URL-osoitetta') {
            navigator.clipboard.writeText(urlText);
            alert('Kopioitu leikepöydälle: ' + urlText);
        }
    });
});