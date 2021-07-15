class Player {
    constructor(transform, color) {
        this.isTalking = false;
        this.text = "";
        this.talkTimer = 0;
        this.transform = transform;
        this.color = color;
        this.isTyping = false;
    }
}

class Transform {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;

        this.canMove = false;
    }
}

const WebSocket = require('ws')
const port = 8080
let connections = {}
let colors = ["#17deee", "#ff7f50", "#ff4162", "#f2e50b", "#21b20c", "#051978"];
let currentID = 0;

const talkTime = 6000;
const fps = 60;

const ws = new WebSocket.Server({ port: port }, () => {
    console.log('server started, listening on port ' + port)
    setInterval(function () { update(); }, 1000 / fps);
})

ws.on('connection', function (ws, req) {
    let player = new Player(new Transform(0, 0, 25), getColor());

    let id = currentID;
    currentID += 1;

    connections[id] = player;

    ws.on('message', (data) => {
        let JSONmessage = JSON.parse(data);

        if (JSONmessage.willTalk) {
            player.isTalking = true;
            player.text = JSONmessage.message;
            player.talkTimer = talkTime;
        }

        if (JSONmessage.isMoving) {
            if (JSONmessage.initMovement) {
                if (isPointInRect(JSONmessage.startX, JSONmessage.startY, player.transform)) {
                    player.canMove = true;
                }
            }

            if (player.canMove) {
                player.transform.x = JSONmessage.moveToX;
                player.transform.y = JSONmessage.moveToY;
            }
        }

        if (JSONmessage.endMovement) {
            player.canMove = false;
        }

    })

    ws.on('close', () => {
        delete connections[id];
        colors.push(player.color);
        console.log('Connection closed');
    })
})


function update() {
    for (const [key, value] of Object.entries(connections)) {
        let player = value;

        if (player.isTalking) {
            player.talkTimer -= 1000 / fps;
            if (player.talkTimer <= 0) {
                player.isTalking = false;
            }
        }
    }

    ws.clients.forEach((client) => {
        let dataArray = Object.values(connections);
        client.send((JSON.stringify(dataArray)))
    })
}

function isPointInRect(x, y, rect) {
    if (
        x > rect.x - rect.radius * 2 &&
        x < rect.x + rect.radius * 2 &&
        y > rect.y - rect.radius * 2 &&
        y < rect.y + rect.radius * 2
    ) {
        return true;
    } else {
        return false;
    }
}

function getColor() {
    let colorIndex = Math.floor(Math.random() * colors.length);
    let color = colors[colorIndex];
    colors.splice(colorIndex, 1);
    return color;
}


