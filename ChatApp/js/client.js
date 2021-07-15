class Input {
    constructor() {
        this.isMoving = false;
        this.startX = 0;
        this.startY = 0;
        this.moveToX = 0;
        this.moveToY = 0;
        this.initMovement = false;
        this.endMovement = false;

        this.willTalk = false;
        this.message = "";
    }
}
//192.168.8.103
const socket = new WebSocket('ws://localhost:8080');

socket.addEventListener('open', function (event) {
    console.log('Connected to WS Server')
});

socket.addEventListener('message', function (event) {
    update(JSON.parse(event.data));
});

let canvas;
let ctx;
let input;

let offsetX;
let offsetY;

$(document).ready(function () {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    refreshCanvas();
    $(window).resize(function () { refreshCanvas(); });

    input = new Input();

    canvas.onmousedown = (event) => {
        event.preventDefault();
        event.stopPropagation();

        let x = parseInt(event.clientX - canvas.width * 0.5);
        let y = parseInt(event.clientY - canvas.height * 0.5);
        input.startX = x;
        input.startY = y;
        input.moveToX = x;
        input.moveToY = y;

        input.isMoving = true;
        input.initMovement = true;
        socket.send(JSON.stringify(input));
        input.initMovement = false;
    }

    canvas.onmousemove = (event) => {
        input.moveToX = parseInt(event.clientX - canvas.width * 0.5);
        input.moveToY = parseInt(event.clientY - canvas.height * 0.5);

        socket.send(JSON.stringify(input));
    }

    canvas.onmouseup = (event) => {
        input.isMoving = false;
        input.endMovement = true;
        socket.send(JSON.stringify(input));
        input.endMovement = false;
    }

    let msgInput = document.getElementById("msgInput");
    msgInput.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            if (msgInput.value) {
                input.willTalk = true;
                input.message = msgInput.value;
                socket.send(JSON.stringify(input));
                input.willTalk = false;
                msgInput.value = "";
            }
        }
    });

});

function refreshCanvas() {
    canvasBounding = canvas.getBoundingClientRect();
    offsetX = canvasBounding.left;
    offsetY = canvasBounding.top;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - $('#messageInput').outerHeight(true) - 50;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function update(data) {
    console.log(data);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < data.length; i++) {
        let player = data[i];
        let xPosition = player.transform.x + canvas.width * 0.5;
        let yPosition = player.transform.y + canvas.height * 0.5;

        ctx.beginPath();
        ctx.arc(xPosition, yPosition, player.transform.radius, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fillStyle = player.color;
        ctx.fill();

        if (player.isTalking) {
            ctx.fillStyle = '#000000';
            ctx.font = "20px mini-wakuwaku";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            ctx.fillText(player.text, player.transform.x + canvas.width * 0.5, player.transform.y + canvas.height * 0.5 - player.transform.radius * 2 + 5);
        }
    }
}

