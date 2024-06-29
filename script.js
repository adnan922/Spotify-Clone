const playlists = {
    'Playlist 1': [
        { title: "On & On", file: "songs/On & On.mp3", cover: "covers/1.jpg" },
        { title: "DEAF KEV", file: "songs/DEAF KEV.mp3", cover: "covers/2.jpg" },
        { title: "Blank", file: "songs/Blank.mp3", cover: "covers/11.jpg" }
    ],
    'Playlist 2': [
        { title: "Mortals", file: "songs/Mortals.mp3", cover: "covers/3.jpg" },
        { title: "Spektrem", file: "songs/Spektrem.mp3", cover: "covers/4.jpg" },
        { title: "Ignite", file: "songs/Ignite.mp3", cover: "covers/13.jpg" }
    ],
    'Playlist 3': [
        { title: "Why We Lose", file: "songs/Why We Lose.mp3", cover: "covers/5.jpg" },
        { title: "Song 6", file: "songs/6.mp3", cover: "covers/6.jpg" },
        { title: "Fearless", file: "songs/Fearless.mp3", cover: "covers/13.jpg" }
    ],
    'Playlist 4': [
        { title: "Symbolism", file: "songs/Symbolism.mp3", cover: "covers/7.jpg" },
        { title: "Heroes Tonight", file: "songs/Heroes Tonight.mp3", cover: "covers/8.jpg" },
        { title: "Light It Up", file: "songs/Light It Up.mp3", cover: "covers/15.jpg" }
    ],
    'Playlist 5': [
        { title: "MY heart", file: "songs/MY heart.mp3", cover: "covers/9.jpg" },
        { title: "Feel Good", file: "songs/Feel Good.mp3", cover: "covers/10.jpg" },
        { title: "Royalty", file: "songs/Royalty.mp3", cover: "covers/16.jpg" }
    ]
};

let currentPlaylist = 'Playlist 1';
let currentSongIndex = 0;
let isPlaying = false;
let isLooping = false;
let isRandom = false;
let favorites = [];

const playlistList = document.getElementById('playlistList');
const songList = document.getElementById('songList');
const searchBar = document.getElementById('searchBar');
const albumCover = document.getElementById('albumCover');
const playPauseBtn = document.getElementById('playPauseBtn');
const progressBar = document.getElementById('progressBar');
const volumeBar = document.getElementById('volumeBar');
const currentTimeElem = document.getElementById('currentTime');
const durationElem = document.getElementById('duration');
const homeBtn = document.getElementById('homeBtn');
const playlistGrid = document.getElementById('playlistGrid');
const loopBtn = document.getElementById('loopBtn');
const randomBtn = document.getElementById('randomBtn');
const favoriteBtn = document.getElementById('favoriteBtn');

const audio = new Audio();

function loadFavorites() {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
        favorites = JSON.parse(savedFavorites);
        updateFavoritesPlaylist();
    }
}

function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

audio.addEventListener('loadedmetadata', () => {
    durationElem.textContent = formatTime(audio.duration);
});

audio.addEventListener('timeupdate', () => {
    updateProgressBar();
    currentTimeElem.textContent = formatTime(audio.currentTime);
});

audio.addEventListener('ended', () => {
    if (!isLooping) {
        nextSong();
    }
});

function createFeaturedPlaylist() {
    const featuredPlaylist = Object.keys(playlists)[Math.floor(Math.random() * Object.keys(playlists).length)];
    const playlistSongs = playlists[featuredPlaylist];
    const featuredSection = document.getElementById('featuredPlaylist');
    
    featuredSection.innerHTML = `
        <img src="${playlistSongs[0].cover}" alt="${featuredPlaylist}">
        <div class="playlist-info">
            <h3>${featuredPlaylist}</h3>
            <p>${playlistSongs.length} songs</p>
        </div>
    `;
    
    featuredSection.addEventListener('click', () => {
        currentPlaylist = featuredPlaylist;
        loadPlaylist();
    });
}

function createRecommendedPlaylists() {
    const recommendedSection = document.getElementById('recommendedPlaylists');
    recommendedSection.innerHTML = '';
    
    Object.keys(playlists).forEach(playlistName => {
        const playlistDiv = document.createElement('div');
        playlistDiv.className = 'recommended-playlist';
        playlistDiv.innerHTML = `
            <img src="${playlists[playlistName][0].cover}" alt="${playlistName}">
            <h4>${playlistName}</h4>
        `;
        playlistDiv.addEventListener('click', () => {
            currentPlaylist = playlistName;
            loadPlaylist();
        });
        recommendedSection.appendChild(playlistDiv);
    });
}

function createPlaylistGrid() {
    playlistGrid.innerHTML = '';
    Object.keys(playlists).forEach(playlistName => {
        const playlistItem = document.createElement('div');
        playlistItem.className = 'playlist-item';
        playlistItem.dataset.playlist = playlistName;
        playlistItem.innerHTML = `
            <img src="${playlists[playlistName][0].cover}" alt="${playlistName}">
            <p>${playlistName}</p>
        `;
        playlistItem.addEventListener('click', () => {
            currentPlaylist = playlistName;
            loadPlaylist();
        });
        playlistGrid.appendChild(playlistItem);
    });
}

function loadPlaylist() {
    document.getElementById('homeScreen').style.display = 'none';
    playlistGrid.style.display = 'none';
    playlistList.style.display = 'block';
    songList.style.display = 'block';
    displaySongs(playlists[currentPlaylist], currentPlaylist);
    loadSong(0);
}

function displaySongs(songs, playlistName) {
    songList.innerHTML = '';
    if (playlistName) {
        const playlistHeader = document.createElement('h3');
        playlistHeader.textContent = playlistName;
        songList.appendChild(playlistHeader);
    }
    songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <img src="${song.cover}" alt="${song.title}" class="song-cover">
            <span>${song.title}</span>
        `;
        li.addEventListener('click', () => {
            if (playlistName) currentPlaylist = playlistName;
            loadSong(index);
            playSong();
        });
        songList.appendChild(li);
    });
}

function showHome() {
    document.getElementById('homeScreen').style.display = 'block';
    playlistGrid.style.display = 'none';
    playlistList.style.display = 'none';
    songList.style.display = 'none';
    createFeaturedPlaylist();
    createRecommendedPlaylists();
}

function displaySearchResults(results) {
    document.getElementById('homeScreen').style.display = 'none';
    playlistGrid.style.display = 'none';
    playlistList.style.display = 'none';
    songList.style.display = 'block';
    songList.innerHTML = '';
    Object.keys(results).forEach(playlistName => {
        displaySongs(results[playlistName], playlistName);
    });
}

function loadSong(index) {
    currentSongIndex = index;
    const song = playlists[currentPlaylist][index];
    audio.src = song.file;
    albumCover.src = song.cover;
    audio.load();
    
    favoriteBtn.classList.toggle('favorite', favorites.some(favSong => favSong.title === song.title));
}

function playSong() {
    audio.play()
        .then(() => {
            isPlaying = true;
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        })
        .catch((error) => {
            console.error("Error playing audio:", error);
        });
}

function pauseSong() {
    audio.pause();
    isPlaying = false;
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
}

function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + playlists[currentPlaylist].length) % playlists[currentPlaylist].length;
    loadSong(currentSongIndex);
    playSong();
}

function nextSong() {
    if (isRandom) {
        currentSongIndex = Math.floor(Math.random() * playlists[currentPlaylist].length);
    } else {
        currentSongIndex = (currentSongIndex + 1) % playlists[currentPlaylist].length;
    }
    loadSong(currentSongIndex);
    playSong();
}

function updateProgressBar() {
    progressBar.value = (audio.currentTime / audio.duration) * 100;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

function toggleLoop() {
    isLooping = !isLooping;
    audio.loop = isLooping;
    loopBtn.classList.toggle('favorite');
}

function toggleRandom() {
    isRandom = !isRandom;
    randomBtn.classList.toggle('favorite');
}

function toggleFavorite() {
    const currentSong = playlists[currentPlaylist][currentSongIndex];
    const index = favorites.findIndex(song => song.title === currentSong.title);
    
    if (index === -1) {
        favorites.push(currentSong);
        favoriteBtn.classList.add('favorite');
    } else {
        favorites.splice(index, 1);
        favoriteBtn.classList.remove('favorite');
    }
    
    updateFavoritesPlaylist();
    saveFavorites();
}

function updateFavoritesPlaylist() {
    playlists['Favorites'] = favorites;
    if (favorites.length > 0 && !document.querySelector('.playlist-item[data-playlist="Favorites"]')) {
        createPlaylistGrid();
    }
}

// Event Listeners
homeBtn.addEventListener('click', showHome);

document.getElementById('prevBtn').addEventListener('click', prevSong);
document.getElementById('playPauseBtn').addEventListener('click', () => isPlaying ? pauseSong() : playSong());
document.getElementById('nextBtn').addEventListener('click', nextSong);
loopBtn.addEventListener('click', toggleLoop);
randomBtn.addEventListener('click', toggleRandom);
favoriteBtn.addEventListener('click', toggleFavorite);

progressBar.addEventListener('input', (e) => {
    audio.currentTime = (e.target.value / 100) * audio.duration;
});

volumeBar.addEventListener('input', (e) => {
    audio.volume = e.target.value;
});

searchBar.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    if (query === '') {
        showHome();
        return;
    }
    
    const searchResults = {};
    Object.keys(playlists).forEach(playlistName => {
        const filteredSongs = playlists[playlistName].filter(song => 
            song.title.toLowerCase().includes(query)
        );
        if (filteredSongs.length > 0) {
            searchResults[playlistName] = filteredSongs;
        }
    });
    
    displaySearchResults(searchResults);
});

// Initialize the app
loadFavorites();
showHome();