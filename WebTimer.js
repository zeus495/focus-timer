const startButton = document.getElementById("start");
const pauseButton = document.getElementById("pause");
const resumeButton = document.getElementById("resume");
const resetButton = document.getElementById("reset");
const timerDisplay = document.getElementById("timer-display");
const hrs = document.getElementById("hrs");
const mins = document.getElementById("mins");
const sec = document.getElementById("sec");
const fullscreen = document.getElementById("fullscreen-btn");
const fullscreenText = document.getElementById("fullscreen-text");
const container = document.getElementById("fullscreen-container");
const img = document.getElementById("screen");
const ctnScreen = document.getElementById("ctn-screen");
const alarm = new Audio("audio/alarm.mp3");
alarm.loop = true;

let initialTime;
let remainingTime;
let paused = false;
let intervalid = null;
let timerStarted = false;
let timeoutID = null;
let timerFinished = false;

function padInput(input) {
    if (input.value.length === 1 && input.value !== "") {
        input.value = "0" + input.value;
    }
}

function handleEnter(event) {

    if (event.key !== "Enter") {
        return;
    }

    event.preventDefault();
    padInput(event.target);

    if (event.target === hrs) {
        mins.focus();
    }

    else if (event.target === mins) {
        sec.focus();
    }

    else if (event.target === sec) {
        startButton.click()
    }
}

function addZero(input) {
    input.addEventListener("blur", () => {
        padInput(input);
    });
}

addZero(hrs);
addZero(mins);
addZero(sec);

function startTimer() {

    if (intervalid) {
        return;
    }

    let hr = Number(hrs.value);
    let min = Number(mins.value);
    let secs = Number(sec.value);

    initialTime = Math.ceil(hr * 3600 + min * 60 + secs);
    remainingTime = initialTime;

    alarm.pause();
    alarm.currentTime = 0;

    paused = false;
    timerStarted = true;
    updateUI();

    renderTimer();

    intervalid = setInterval(() => {

        if (paused) {
            return;
        }

        remainingTime--;
        renderTimer();

        if (remainingTime <= 0) {
            remainingTime = 0;

            clearInterval(intervalid);
            intervalid = null;

            timeoutID = setTimeout(() => {

                timerDisplay.textContent = "Time's Up!!"
                alarm.play();

                if ("Notification" in window && Notification.permission === "granted") {
                    new Notification("Timer Finished!", {
                        body: "The timer has ended. Press Reset to stop the alarm"
                    })
                }

                timerStarted = false;
                timerFinished = true;
                paused = false;
                updateUI();

            }, 1000)

            clearInterval(intervalid);
            intervalid = null;
        }

    }, 1000);
}

function renderTimer() {

    let hr = Math.floor(remainingTime / 3600);
    let min = Math.floor((remainingTime % 3600) / 60);
    let secs = remainingTime % 60;

    if (min < 10) {
        min = '0' + min;
    }

    if (secs < 10) {
        secs = '0' + secs;
    }

    if (hr > 0) {
        timerDisplay.textContent = `${hr}:${min}:${secs}`;
    }

    if (hr <= 0) {
        timerDisplay.textContent = `${min}:${secs}`
    }

}

function updateUI() {

    if (timerFinished) {
        startButton.style.display = "none";
        pauseButton.style.display = "none";
        resumeButton.style.display = "none";
        resetButton.style.display = "inline-block";
    }

    else if (timerStarted && !paused) {
        startButton.style.display = "none";
        pauseButton.style.display = "inline-block";
        resumeButton.style.display = "none";
        resetButton.style.display = "inline-block";
    }

    else if (timerStarted && paused) {
        startButton.style.display = "none";
        pauseButton.style.display = "none";
        resumeButton.style.display = "inline-block";
        resetButton.style.display = "inline-block";
    }

    else if (!timerStarted) {
        startButton.style.display = "inline-block"
        pauseButton.style.display = "none";
        resumeButton.style.display = "none";
        resetButton.style.display = "none";
    }

}

updateUI();
hrs.focus();

startButton.addEventListener("click", async () => {

    if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
    }

    const hr = Number(hrs.value);
    const min = Number(mins.value);
    const secs = Number(sec.value);

    if (timeoutID) {
        clearTimeout(timeoutID);
        timeoutID = null;
    }

    if (Number.isNaN(hr) || Number.isNaN(min) || Number.isNaN(secs) || hr < 0 || min < 0 || secs < 0 || min >= 60 || secs >= 60 || (hr === 0 && min === 0 && secs === 0)) {
        return;
    }

    else {
        startTimer();
    }

});

hrs.addEventListener("keydown", handleEnter);
mins.addEventListener("keydown", handleEnter);
sec.addEventListener("keydown", handleEnter);

pauseButton.addEventListener("click", () => {
    if (paused) {
        return;
    }

    paused = true;
    updateUI();
});

resumeButton.addEventListener("click", () => {
    if (!paused) {
        return;
    }

    paused = false;
    updateUI();
});

resetButton.addEventListener("click", () => {

    if (timeoutID) {
        clearTimeout(timeoutID);
        timeoutID = null;
    }

    timerFinished = false;
    timerStarted = false;
    paused = false;
    updateUI();

    alarm.pause();
    alarm.currentTime = 0;

    clearInterval(intervalid);
    intervalid = null;
    remainingTime = initialTime;

    renderTimer();
    hrs.focus();

});

fullscreen.addEventListener("click", () => {
    if (!document.fullscreenElement) {

        ctnScreen.requestFullscreen()
            .then(() => {
                fullscreenText.textContent = "Exit Fullscreen";
                img.src = "images/exit-fullscreen.png";
            })
            .catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message}`);
            })
    }

    else {
        document.exitFullscreen();
        fullscreenText.textContent = "Fullscreen"
        img.src = "images/fullscreen.png"
    }
});

document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement) {
        fullscreenText.textContent = "Exit Fullscreen";
        img.src = "images/exit-fullscreen.png";
    }

    else {
        fullscreenText.textContent = "Fullscreen"
        img.src = "images/fullscreen.png"
    }
})

document.addEventListener("keydown", (event) => {
    if (event.key !== "F11") {
        return;
    }

    else {
        event.preventDefault();
    }

    if (!document.fullscreenElement) {
        ctnScreen.requestFullscreen()

            .then(() => {
                fullscreenText.textContent = "Exit Fullscreen";
                img.src = "images/exit-fullscreen.png";
            })
            .catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message}`);
            });
    }

    else {
        document.exitFullscreen();
        fullscreenText.textContent = "Fullscreen"
        img.src = "images/fullscreen.png"
    }

})
