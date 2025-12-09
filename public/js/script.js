const eyeIcon = document.querySelector("#eyeIcon");
const pwd = document.querySelector("#pwd");
if (eyeIcon && pwd) {
    eyeIcon.addEventListener("click", () => {
        const isHidden = pwd.type === "password";
        pwd.type = (isHidden) ? "text" : "password";
        eyeIcon.classList.toggle("bi-eye", !isHidden);
        eyeIcon.classList.toggle("bi-eye-slash", isHidden);
    });
}

const eyeIcons = document.querySelectorAll('.iconEye');
eyeIcons.forEach(icon => {
    icon.addEventListener('click', () => {
        const target = icon.dataset.target;
        const pwdField = document.querySelector(target);
        if (pwdField) {
            const isHidden = pwdField.type === "password";
            pwdField.type = (isHidden) ? "text" : "password";
            icon.classList.toggle("bi-eye", !isHidden);
            icon.classList.toggle("bi-eye-slash", isHidden);
        }
    });
});
let currentSong = {};


function closeModal(modalId) {
    document.querySelector('#' + modalId).style.display = 'none';
    if (modalId === 'videoModal') {
        document.querySelector('#youtubePlayer').src = '';
    }
}

window.onclick = function (event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.style.display = 'none';
        if (event.target.id === 'videoModal') {
            document.querySelector('#youtubePlayer').src = '';
        }
    }
}

async function playSong(title) {
    let response = await fetch(`/youtube-search?q=${title}`);
    let data = await response.json();
    document.querySelector('#youtubePlayer').src = `https://www.youtube.com/embed/${data.videoId}?autoplay=1`;
    document.querySelector('#videoModal').style.display = 'flex';
}

async function openPlaylistModal(songName, artistName) {
    currentSong = { songName, artistName };
    let modal = document.querySelector('#playlistModal');
    let select = document.querySelector('#playlistSelect');
    let messageBox = document.querySelector('#playlistMessage');
    if (messageBox) messageBox.textContent = '';

    select.innerHTML = '<option>Loading...</option>';
    modal.style.display = 'flex';

    try {
        let response = await fetch('/api/playlists');
        let playlists = await response.json();

        select.innerHTML = '';
        if (playlists.length === 0) {
            select.innerHTML = '<option value="">No playlists found</option>';
            return;
        }
        playlists.forEach(p => {
            let playlistOption = document.createElement('option');
            playlistOption.value = p.playlistId;
            playlistOption.textContent = p.playlistName;
            select.append(playlistOption);
        });
    } catch (error) {
        console.error(error);
        select.innerHTML = '<option>Error loading playlists</option>';
    }
}

async function addToPlaylist() {
    let playlistId = document.querySelector('#playlistSelect').value;
    let messageBox = document.querySelector('#playlistMessage');

    if (!playlistId) {
        messageBox.style.color = 'red';
        messageBox.textContent = 'Please create a playlist on the profile page first!';
        return;
    }

    try {
        let response = await fetch('/add-to-playlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                playlistId,
                songName: currentSong.songName,
                artistName: currentSong.artistName
            })
        });

        let result = await response.json();

        if (result.success) {
            messageBox.style.color = 'green';
            messageBox.textContent = 'Song added to playlist!';
        } else {
            messageBox.style.color = 'red';
            messageBox.textContent = result.message || 'Failed to add song';
        }
    } catch (error) {
        console.error(error);
        messageBox.style.color = 'red';
        messageBox.textContent = 'Error connecting to server';
    }
}

async function addToFavorites(songName, artistName, btn) {
    let response = await fetch('/add-favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songName, artistName })
    });
    let result = await response.json();
    if (result.success) {
        btn.innerHTML = '✅';
        btn.disabled = true;
    }
}
