
// LORD IGRIS - ROCK PAPER SCISSORS
// HTML ELEMENTS


const video = document.getElementById("webcam");
const canvas = document.getElementById("output-canvas");
const ctx = canvas.getContext("2d");

const aiMessage = document.getElementById("ai-message");

const playerMove = document.getElementById("player-move");
const computerChoice = document.getElementById("computer-choice");

const playerScoreElement = document.getElementById("player-score");
const computerScoreElement = document.getElementById("computer-score");

const resultText = document.getElementById("result-text");

const countdown = document.getElementById("countdown");

const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");



// SOUND EFFECTS


const startSound = new Audio("sounds/start.mp3");
const uiStartSound = new Audio("sounds/ui-start.mp3");
const countdownSound = new Audio("sounds/321-go.mp3");

const evilLaughSound = new Audio("sounds/laugh-evil.mp3");
const loseSound = new Audio("sounds/level-3.mp3");
const drawSound = new Audio("sounds/grunt.mp3");
const sarcasticSound = new Audio("sounds/sarcastic.mp3");


// ======================================================
// GAME VARIABLES
// ======================================================
let duelInProgress = false;
let playerGesture = "";
let computerGesture = "";

let playerScore = 0;
let computerScore = 0;

let gameRunning = false;
let canCapture = false;

let typingInterval = null;

// ======================================================
// MEDIAPIPE SETUP


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


hands.onResults(onResults);



// ======================================================
// CAMERA
// ======================================================

async function startCamera(){

    try{

        const stream = await navigator.mediaDevices.getUserMedia({

            video:true

        });

        video.srcObject = stream;

        video.onloadedmetadata = ()=>{

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

        
            aiMessage.textContent = "> Human Detected ✓";
            startSound.volume = 0.5;
            startSound.play();  

        };
        

    }

    catch(error){
        sarcasticSound.currentTime = 0;
    sarcasticSound.play();

        console.log(error);

        aiMessage.textContent =
        "> open your camera and refresh the page you puny human";


    }

}

startCamera();



// ======================================================
// MEDIAPIPE RESULTS
// ======================================================

function onResults(results){

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        
        // FIX: Only overwrite the text if a duel isn't currently wrapping up or typing
        if (!duelInProgress && !gameRunning) {
            aiMessage.textContent = "> Challenger Detected ✓";
        }

        for(const landmarks of results.multiHandLandmarks){

            drawConnectors(
                ctx,
                landmarks,
                HAND_CONNECTIONS,
                {
                    color:"#00E5FF",
                    lineWidth:5
                }
            );

            drawLandmarks(
                ctx,
                landmarks,
                {
                    color:"#C86BFF",
                    radius:6
                }
            );

            const gesture = detectGesture(landmarks);

            // Update UI
            switch(gesture){
                case "rock":
                    playerMove.textContent = "✊ Rock";
                    break;
                case "paper":
                    playerMove.textContent = "✋ Paper";
                    break;
                case "scissors":
                    playerMove.textContent = "✌️ Scissors";
                    break;
                default:
                    playerMove.textContent = "🤔 Unknown";
            }

            // Save the gesture when GO! is active
            if(canCapture){
                playerGesture = gesture;
                canCapture = false;
            }
        }
    }
    else {
        // FIX: Only revert to waiting if a round isn't processing a result
        if (!duelInProgress && !gameRunning) {
            aiMessage.textContent = "> Waiting For Challenger...";
        }
    }
}

// ======================================================
// BUTTON EVENTS
// ======================================================

startBtn.addEventListener("click",startGame);

resetBtn.addEventListener("click",resetGame);



// ======================================================
// EMPTY FUNCTIONS
// (We'll build them in Part 2)
// ======================================================

function startGame(){
    uiStartSound.currentTime = 0;
    uiStartSound.play();

    countdownSound.currentTime = 0;
    countdownSound.play();
  
    duelInProgress = true;

    if(gameRunning) return;

    gameRunning = true;

    startBtn.disabled = true;

    playerGesture = "";

    computerChoice.textContent = "?";

    resultText.textContent = "Prepare Yourself...";

    let count = 3;

    countdown.textContent = count;

    const timer = setInterval(()=>{

        count--;

        if(count > 0){

            countdown.textContent = count;

        }

        else if(count === 0){

            countdown.textContent = "GO!";

            canCapture = true;

        }

      else{

    clearInterval(timer);

    setTimeout(() => {

        finishRound();

    },500);

}
    },1000);

}

function getComputerMove(){

    const moves=[

        "rock",

        "paper",

        "scissors"

    ];

    const random=Math.floor(Math.random()*3);

    return moves[random];

}


function resetGame(){

    playerScore=0;

    computerScore=0;

    playerScoreElement.textContent=0;

    computerScoreElement.textContent=0;

    resultText.textContent="Challenge The Grandmaster";

    playerMove.textContent="Waiting...";

    computerChoice.textContent="?";

}
function finishRound(){

    gameRunning = false; // The game loop finishes, but the duel sequence is still wrapping up

    typeMessage("> Scanning complete...");


    computerChoice.textContent = "🧠";

    resultText.textContent = "Lord Igris is thinking...";

    setTimeout(() => {

        computerGesture = getComputerMove();

        switch(computerGesture){
            case "rock":
                computerChoice.textContent = "✊";
                break;
            case "paper":
                computerChoice.textContent = "✋";
                break;
            case "scissors":
                computerChoice.textContent = "✌️";
                break;
        }

        // 1. Run the winner logic (this triggers the random win/lose message)
        decideWinner();
        
        // 2. KEEP duelInProgress = true for now so MediaPipe doesn't wipe out the text!
        // Calculate total typing duration: roughly 35ms per character * message length.
        // We will unlock the game buttons and let MediaPipe take back control after 2.5 seconds.
        setTimeout(() => {
            duelInProgress = false;
            startBtn.disabled = false;
        }, 2500); 

    }, 100); // Simulate thinking time for Lord Igris
}
function decideWinner(){

    if(playerGesture===""){

        resultText.textContent="No Gesture Detected";
        //gameRunning = false;
        //startBtn.disabled = false;
        //duelInProgress = false;
        typeMessage("> Hold up your hand clearly at 'GO!'...");
         setTimeout(() => {
            duelInProgress = false;
            startBtn.disabled = false;
         }, 2500);

        return;

    }

    if(playerGesture===computerGesture){
        drawSound.currentTime = 0;
        drawSound.play();  

        resultText.textContent="🤝 Draw";
        const drawLines = [

    "> Again.",

    "> Acceptable.",

    "> A stalemate.",

    "> Interesting...",

    "> We are evenly matched."

];

typeMessage(randomMessage(drawLines));

        return;

    }

    if(

        (playerGesture==="rock" && computerGesture==="scissors")||

        (playerGesture==="paper" && computerGesture==="rock")||

        (playerGesture==="scissors" && computerGesture==="paper")

    ){

        playerScore++;

        playerScoreElement.textContent=playerScore;
        loseSound.currentTime = 0;
        loseSound.play();
        resultText.textContent = "🎉 You Win!";
        const loseLines = [

    "> Impossible...",

    "> You got lucky.",

    "> Hmph...",

    "> This duel isn't over.",

    "> I underestimated you."

];

typeMessage(randomMessage(loseLines));

    }

    else{

        computerScore++;

        computerScoreElement.textContent=computerScore;
        evilLaughSound.currentTime = 0;
        evilLaughSound.play();

        resultText.textContent="👑 Lord Igris Wins!";
        const winLines = [

    "> As expected.",

    "> Pathetic.",

    "> Did you really think that would work?",

    "> I calculated your move before you moved.",

    "> You disappoint me."

];

typeMessage(randomMessage(winLines));

    }

}
// ======================================================
// GESTURE DETECTION
// ======================================================

function detectGesture(landmarks){

    const thumbOpen = landmarks[4].x < landmarks[3].x;

    const indexOpen = landmarks[8].y < landmarks[6].y;

    const middleOpen = landmarks[12].y < landmarks[10].y;

    const ringOpen = landmarks[16].y < landmarks[14].y;

    const pinkyOpen = landmarks[20].y < landmarks[18].y;


    // =========================
    // ROCK
    // =========================

    if(

        !thumbOpen &&
        !indexOpen &&
        !middleOpen &&
        !ringOpen &&
        !pinkyOpen

    ){

        return "rock";

    }


    // =========================
    // PAPER
    // =========================

    if(

        thumbOpen &&
        indexOpen &&
        middleOpen &&
        ringOpen &&
        pinkyOpen

    ){

        return "paper";

    }


    // =========================
    // SCISSORS
    // =========================

    if(

        !thumbOpen &&
        indexOpen &&
        middleOpen &&
        !ringOpen &&
        !pinkyOpen

    ){

        return "scissors";

    }


    return "unknown";

}
function typeMessage(message){

    // Stop previous typing animation
    clearInterval(typingInterval);

    aiMessage.textContent = "";

    let i = 0;

    typingInterval = setInterval(() => {

        aiMessage.textContent += message[i];

        i++;

        if(i >= message.length){

            clearInterval(typingInterval);

        }

    },30);

}
function randomMessage(messages){

    return messages[Math.floor(Math.random() * messages.length)];

}
