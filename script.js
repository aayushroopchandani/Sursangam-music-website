console.log("let's write some js ");
const baseURL = window.location.origin;
let titles = [];
let lists;
let songs;
let currentSong;
let currentIdx;
let currentAudio;
let currentFolder;
const songsList = document.querySelector('.songsList');
let prevIdx = -1;
const prevBtn = document.querySelector('.songButtons img:nth-child(1)');
const playBtn = document.querySelector('.songButtons img:nth-child(2)');
const nextBtn = document.querySelector('.songButtons img:nth-child(3)');
const songInfo = document.querySelector('.songInfo');
const songTime = document.querySelector('.songTime p');
let cards = [];
const volContainer = document.querySelector('.volSeekbarContainer');
const soundImg = document.querySelector('.volume img');
const handleHover = (element, className) => {
    element.classList.toggle(className);
};
let isDragging = false; // important
let isTrackDragging = false;

//this is the function which converts seconds to minutes in this format 00:00
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
const prevNextSong = (direction) => {
    // Calculate new index based on direction (prev or next)
    let newIdx = currentIdx + direction;

    // Ensure the index wraps around within the bounds of the song list
    if (newIdx < 0) {
        newIdx = songs.length - 1; // Go to last song if it's at the beginning
    } else if (newIdx >= songs.length) {
        newIdx = 0; // Go to first song if it's at the end
    }

    currentIdx = newIdx;
    lists[currentIdx].classList.add("liClick");
    currentSong = songs[currentIdx];
    playMusic(currentIdx);
};

const getSongs = async (folder) => {
    let a = await fetch(`${baseURL}/${folder}/`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.querySelectorAll("a");
    songs = [];
    titles = [];
    as.forEach((a) => {
        if (a.href.endsWith(".mp3")) {
            songs.push(a.href);
            titles.push(a.title);
        }
    });
    console.log(titles);
    return songs;
};


const chooseSong = (lists) => {
    lists.forEach((val, idx) => {
        val.addEventListener("click", () => {
            console.log(val, idx);

            currentIdx = idx;
            currentSong = songs[idx];
            playMusic(idx);
        });


    });

}
prevBtn.addEventListener("click", () => {
    prevNextSong(-1); // -1 for previous song
});

nextBtn.addEventListener("click", () => {
    prevNextSong(1); // 1 for next song
});

const playMusic = (idx) => {
    if (currentAudio) {
        currentAudio.pause();
        // currentAudio.currentTime = 0;
        lists[prevIdx].classList.remove("liClick");
    }
    currentAudio = new Audio(currentSong);
    currentAudio.play();
    songInfo.innerText = titles[idx].replace(/^128-/i, '').replace(/128 Kbps\.mp3$/i, '');
    lists[idx].classList.add("liClick");

    prevIdx = idx;
    //timeupdate event
    currentAudio.addEventListener("timeupdate", () => {
        // This will give you the audio duration
        songTime.innerText = `${secondsToMinutesSeconds(currentAudio.currentTime)} / ${secondsToMinutesSeconds(currentAudio.duration)}`;
        document.querySelector('.circle').style.left = (currentAudio.currentTime / currentAudio.duration) * 100 + "%";
        songInfo.classList.add("p-2");
        if (currentAudio.currentTime === currentAudio.duration) {
            prevNextSong(1); // 1 for next song

        }
    });

    // Now I am adding event listener on seekBar offsetX means the  x coordinate y corrdinate is fixed 
    (document.querySelector('.seekBar')).addEventListener("click", (e) => {
        let per = (e.offsetX / e.target.getBoundingClientRect().width);
        document.querySelector('.circle').style.left = document.querySelector('.circle').style.left = `${per * 100}%`;
        currentAudio.currentTime = per * currentAudio.duration;
    });



};

const setTitle = () => {
    songsList.innerHTML = "<ul> </ul>";
    const songUL = document.querySelector('.songsList ul');
    titles.forEach((title) => {
        let li = document.createElement("li");
        let str = title.replace(/^128-/i, '').replace(/128 Kbps\.mp3$/i, '');
        let parts = str.split("-");
        li.innerHTML = `<img src="img/music.svg" alt="music">
                        <div class="info">
                            <div>${parts[0]}</div>
                            <div>${parts[1]}</div>
                        </div>
                        <div class="playNow">
                        </div>`;
        songUL.append(li);
    });
    lists = Array.from(document.querySelector('.songsList').getElementsByTagName("li"));
    chooseSong(lists);



};

const displayAlbums = (async () => {
    let a = await fetch(`${baseURL}/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.querySelectorAll("a");
    let cardContainer = document.querySelector('.cardContainer');
    Array.from(anchors).forEach(async (e, idx) => {
        if (idx != 1) {
            if (e.href.includes("/songs")) {
                let folder = e.href.split("/").slice(-1)[0];
                currentFolder = folder;
                console.log(folder);
                let a = await fetch(`${baseURL}/songs/${folder}/info.json`);
                let response = await a.json();
                //   http://127.0.0.1:5500/songs/diljit/info.json 
                console.log(response);
                cardContainer.innerHTML += `<div class="card pointer" data-folder="${folder}">
                        <div class="play flex items-center justify-center pointer">


                            <svg data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 24 24" width="40"
                                height="40">
                                <path
                                    d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z">
                                </path>
                            </svg>


                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`;

            }
        }

    });
    setTimeout(() => {
        cards = document.querySelectorAll('.card');
        console.log(cards);
        Array.from(cards).forEach((card) => {
            card.addEventListener("click", async () => {
                songs = await getSongs(`songs/${card.dataset.folder}`);
                setTitle();
            });
        });
    }, 100);

    console.log(anchors);
});


let play = document.querySelector('.songButtons img:nth-child(2)');
const main = async () => {
    //this is the list of songs 
    let songs = await getSongs("songs/diljit");
    console.log(songs);
    setTitle(titles);

    //displaying all the dynamic albums 
    displayAlbums();


    // now i am attaching event listener on hamburger
    document.querySelector('.hamburger').addEventListener("click", () => {
        document.querySelector('.left').style.left = "0%";
    });

    //event on cross 
    document.querySelector('.logo img:nth-child(2)').addEventListener("click", () => {
        document.querySelector('.left').style.left = "-100%";
    });

    //volume event 


    document.querySelector('.volume').addEventListener("mouseenter", () => {
        volContainer.classList.add("flex");
        volContainer.classList.remove("hide");
    });
    document.querySelector('.volume').addEventListener("mouseleave", () => {
        volContainer.classList.remove("flex");
        volContainer.classList.add("hide");
    });
    document.querySelector('.volume img').addEventListener("click", () => {
        if (soundImg.src === `${baseURL}/img/mute.svg`) {
            soundImg.src = `img/volume.svg`;
            currentAudio.volume = 1;
            document.querySelector('#volumeIp').value = 100;
        }
        else {
            soundImg.src = `img/mute.svg`;
            currentAudio.volume = 0;
            document.querySelector('#volumeIp').value = 0;
        }
    });


    document.querySelector('#volumeIp').addEventListener("input", (e) => {
        if (e.target.value == 0) {
            soundImg.src = "img/mute.svg";
        }
        else {
            soundImg.src = "img/volume.svg";
        }
        currentAudio.volume = e.target.value / 100;

    });
    //attaching events on play in playbar

    playBtn.addEventListener("click", () => {
        if (currentAudio.paused) {
            currentAudio.play();
            playBtn.src = "img/play.svg";
        }
        else {
            currentAudio.pause();
            playBtn.src = "img/pause.svg";
        }
    });

};

main();



//to prevent default event on on spacebar which is scroll down
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Spacebar') { // Space key can be detected as ' ' or 'Spacebar' depending on browser
        e.preventDefault(); // Prevent the default scroll action
    }
});



// for space bar event which is if soace bar is clicked song should be paused and if it is paused it should be played 
document.addEventListener("keydown", (evt) => {
    if (evt.code === "Space") {
        if (currentAudio.paused) {
            currentAudio.play();
            playBtn.src = "img/play.svg";
        }
        else {
            currentAudio.pause();
            playBtn.src = "img/pause.svg";
        }
    }
})

