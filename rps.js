// ============================
// HTML Elements
// ============================
const startBtn = document.getElementById("start-btn");
const video = document.getElementById("webcam");
const canvas = document.getElementById("output-canvas");
const ctx = canvas.getContext("2d");
const countdown = document.getElementById("countdown");

const resultText = document.getElementById("result-text");

const playerScoreElement = document.getElementById("player-score");

const computerScoreElement = document.getElementById("computer-score");
const aiMessage = document.getElementById("ai-message");
// ============================
// Game Variables
// ============================

let gameRunning = false;
let playerGesture = "";
let computerMove = "";

let playerScore = 0;
let computerScore = 0;

// ============================
// MediaPipe Hands
// ============================

const hands = new Hands({

    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }

});

hands.setOptions({

    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7

});

// ============================
// When MediaPipe finds a hand
// ============================

hands.onResults(onResults);

// ============================
// Start Camera
// ============================

async function startCamera(){

    const stream = await navigator.mediaDevices.getUserMedia({

        video:true

    });

    video.srcObject = stream;

    video.onloadedmetadata = () =>{

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const camera = new Camera(video,{

            onFrame: async ()=>{

                await hands.send({

                    image:video

                });

            },

            width:video.videoWidth,
            height:video.videoHeight

        });

        camera.start();

    };

}

startCamera();
startBtn.addEventListener("click",startGame);
// ============================
// Draw Hand
// ============================

function onResults(results){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    if(results.multiHandLandmarks){

        aiMessage.textContent="Hand Detected ✅";

        for(const landmarks of results.multiHandLandmarks){

            drawConnectors(
                ctx,
                landmarks,
                HAND_CONNECTIONS,
                {
                    color:"#00FFFF",
                    lineWidth:4
                }
            );

            drawLandmarks(
                ctx,
                landmarks,
                {
                    color:"#ff00ff",
                    radius:5
                }
            );
            const gesture = detectGesture(landmarks);
            if(gameRunning){

    playerGesture = gesture;

}
            const computerMove = getComputerMove();

const computerChoice = document.getElementById("computer-choice");

if (computerMove === "rock") {

    computerChoice.textContent = "✊";

}
else if (computerMove === "paper") {

    computerChoice.textContent = "✋";

}
else {

    computerChoice.textContent = "✌️";

}

const playerMove = document.getElementById("player-move");

if (gesture === "rock") {

    playerMove.textContent = "✊ Rock";

}
else if (gesture === "paper") {

    playerMove.textContent = "✋ Paper";

}
else if (gesture === "scissors") {

    playerMove.textContent = "✌️ Scissors";

}
else {

    playerMove.textContent = "🤔 Unknown";

}

        }

    }

    else{

        aiMessage.textContent="Show me your hand...";

    }

}
function detectGesture(landmarks) {

    const thumbOpen = landmarks[4].x < landmarks[3].x;

    const indexOpen = landmarks[8].y < landmarks[6].y;

    const middleOpen = landmarks[12].y < landmarks[10].y;

    const ringOpen = landmarks[16].y < landmarks[14].y;

    const pinkyOpen = landmarks[20].y < landmarks[18].y;


    // ✊ Rock
    if (
        !thumbOpen &&
        !indexOpen &&
        !middleOpen &&
        !ringOpen &&
        !pinkyOpen
    ) {
        return "rock";
    }


    // ✋ Paper
    if (
        thumbOpen &&
        indexOpen &&
        middleOpen &&
        ringOpen &&
        pinkyOpen
    ) {
        return "paper";
    }


    // ✌️ Scissors
    if (
        !thumbOpen &&
        indexOpen &&
        middleOpen &&
        !ringOpen &&
        !pinkyOpen
    ) {
        return "scissors";
    }


    return "unknown";

}
function getComputerMove() {

    const moves = ["rock", "paper", "scissors"];

    const randomIndex = Math.floor(Math.random() * 3);

    return moves[randomIndex];

}
function getComputerMove(){

    const moves = ["rock","paper","scissors"];

    const randomIndex = Math.floor(Math.random()*3);

    return moves[randomIndex];

}
function startGame(){

    if(gameRunning) return;

    gameRunning = true;

    let count = 3;

    countdown.textContent = count;

    const timer = setInterval(()=>{

        count--;

        if(count>0){

            countdown.textContent = count;

        }

        else if(count===0){

            countdown.textContent = "GO!";

        }

        else{

            clearInterval(timer);

            countdown.textContent = "";

            finishRound();

        }

    },1000);

}
function finishRound(){

    gameRunning = false;

    computerMove = getComputerMove();

    document.getElementById("computer-choice").textContent =

        computerMove==="rock" ? "✊"

        : computerMove==="paper" ? "✋"

        : "✌️";

    decideWinner();

}
function decideWinner(){

    if(playerGesture===computerMove){

        resultText.textContent="🤝 Draw!";

        return;

    }

    if(

        (playerGesture==="rock" && computerMove==="scissors")||

        (playerGesture==="paper" && computerMove==="rock")||

        (playerGesture==="scissors" && computerMove==="paper")

    ){

        playerScore++;

        playerScoreElement.textContent=playerScore;

        resultText.textContent="🎉 You Win!";

    }

    else{

        computerScore++;

        computerScoreElement.textContent=computerScore;

        resultText.textContent="👑 Lord Igris Wins!";

    }

}
