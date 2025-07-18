console.log('javaScript is inserted in the file');
let currentSong = new Audio();

let songs;
let currFolder;


function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Pad minutes and seconds to ensure two digits
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;

    // fetching all the songs from the folder 
    let a = await fetch(`http://127.0.0.1:3000/spotify-clone/${folder}/`)
    // console.log(folder);
    
    let response = await a.text()

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName('a')


    // adding and filtering the song name
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];

        if (element.href.endsWith(".mp3")) {

            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // add all songs to the ui 
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML += `<li>
        
                            <img class="invert" src="img/music.svg" alt="music logo">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Ajeeb banda</div>
                            </div>

                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div>
                        
        </li>`;
    }

    // Attach an event listener to each song 
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.getElementsByTagName("div")[1].innerHTML);

            playMusic(e.getElementsByTagName("div")[1].innerHTML.trim());

        })
    })

    playMusic(songs[0], true);

    return songs;

}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    currentSong.src = `/spotify-clone/${currFolder}/` + track
    // console.log(`/${currFolder}/` + track);
    

    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"

    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/spotify-clone/songs/`)
    let response = await a.text()

    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {

        const e = array[index];
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            // Get the metadata of the folder

            let a = await fetch(`http://127.0.0.1:3000/spotify-clone/songs/${folder}/info.json`)
            let response = await a.json()
            // console.log(response);


            cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="50" height="50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="50" cy="50" r="48" fill="#1ed760" stroke="" stroke-width="" />
                                <polygon points="40,30 70,50 40,70" fill="black" />
                            </svg>
                        </div>

                        <img src="/spotify-clone/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`

        }

    }


    // Load the playlist whenever card is clicked 

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        // console.log(e.dataset.folder)

        e.addEventListener("click", async (item) => {
            // console.log(`${item.currentTarget.dataset.folder}`);

            // Do this whenever new card is clicked 
            play.src = "img/play.svg"
            document.querySelector(".circle").style.left = 0




            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)

        })
    })


}

async function main() {

    // get all songs 
    await getSongs("songs/cs")
    playMusic(songs[0], true);

    // Display all the albums on the page
    displayAlbums()




    // add event listener to play, next, previous
    let play = document.getElementById("play")
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()

            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()

            play.src = "img/play.svg"
        }
    })


    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);

        // updating time every second
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`

        // updating seekbar every second
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"

    })

    // Add an event Listener to seekbar

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        // console.log(e)
        // console.log(e.target.getBoundingClientRect().width, e.offsetX);

        // total width of the seekbar
        // e.target.getBoundingClientRect().width

        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"

        currentSong.currentTime = ((currentSong.duration) * percent) / 100

    })

    // Add an event listener to hamburger

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener to close button

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })


    // Add an event listener to previous button with targetting ID

    document.getElementById("previous").addEventListener("click", () => {
        // console.log('previous clicked');

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

        if ((index) > 0) {
            playMusic(songs[index - 1])
        }

        else {
            playMusic(songs[songs.length - 1])
        }

    })


    // Add an event listener to next button withot targetting ID since ID is global variable in some browser

    next.addEventListener("click", () => {
        // console.log('next clicked');

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        // console.log(songs, index)
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }

        else {
            playMusic(songs[0])
        }

    })

    // Add an event to volume

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log(e, e.target, e.target.value)

        currentSong.volume = parseInt(e.target.value) / 100;

    })


    // Load the playlist whenever card is clicked 

    // Array.from(document.getElementsByClassName("card")).forEach(e => {
    //     console.log(e.dataset.folder)

    //     e.addEventListener("click", async (item) => {
    //         console.log(`${item.currentTarget.dataset.folder}`);

    //         songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)

    //     })
    // })

    // Add the event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", (e) => {
        // console.log(e.target);
        if (e.target.src.includes("volume.svg")) {
            e.target.src = "img/mute.svg";
            currentSong.volume = 0.0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }

        else {
            e.target.src = "img/volume.svg";
            currentSong.volume = 0.5;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 50

        }

    })


}

main()