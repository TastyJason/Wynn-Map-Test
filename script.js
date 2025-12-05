// Setup canvas
const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Load the map image
const mapImg = new Image();
mapImg.src = "map.png";

// Map state
let scale = 1;
let offsetX = 0;
let offsetY = 0;

// Drag state
let dragging = false;
let lastX = 0;
let lastY = 0;

// Create floating coordinate display
const coordDisplay = document.createElement("div");
coordDisplay.id = "coordDisplay";

coordDisplay.style.position = "fixed";
coordDisplay.style.left = "50%";
coordDisplay.style.bottom = "20px";
coordDisplay.style.transform = "translateX(-50%)";

coordDisplay.style.fontSize = "22px";
coordDisplay.style.fontWeight = "bold";
coordDisplay.style.fontFamily = "monospace";

coordDisplay.style.padding = "4px 10px";
coordDisplay.style.background = "rgba(0,0,0,0.45)";
coordDisplay.style.color = "white";
coordDisplay.style.borderRadius = "6px";
coordDisplay.style.pointerEvents = "none";
coordDisplay.style.zIndex = "9999";

document.body.appendChild(coordDisplay);


// Clamp movement so map cannot scroll away
function clampOffsets() {
    const imgW = mapImg.naturalWidth * scale;
    const imgH = mapImg.naturalHeight * scale;

    // Case 1: MAP WIDTH SMALLER THAN CANVAS → center it
    if (imgW <= canvas.width) {
        offsetX = (canvas.width - imgW) / 2;
    } else {
        const minOffsetX = canvas.width - imgW;
        offsetX = Math.min(0, Math.max(minOffsetX, offsetX));
    }

    // Case 2: MAP HEIGHT SMALLER THAN CANVAS → center it
    if (imgH <= canvas.height) {
        offsetY = (canvas.height - imgH) / 2;
    } else {
        const minOffsetY = canvas.height - imgH;
        offsetY = Math.min(0, Math.max(minOffsetY, offsetY));
    }
}


// Draw map
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    ctx.drawImage(mapImg, 0, 0);
    ctx.restore();
}

mapImg.onload = draw;


// Mouse drag movement
canvas.addEventListener("mousedown", e => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener("mousemove", e => {
    if (dragging) {
        offsetX += e.clientX - lastX;
        offsetY += e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        clampOffsets();
        draw();
    }

    // update live coords (no decimals)
function mapToGame(mapX, mapY) {
    const gameX = mapX * 0.30496 - 1340.9;
    const gameY = mapY * -1.2 + 171;
    return {
        x: Math.round(gameX),
        y: Math.round(gameY)
    };
}

canvas.addEventListener("mouseup", () => dragging = false);
canvas.addEventListener("mouseleave", () => dragging = false);


// Zoom handling
canvas.addEventListener("wheel", e => {
    e.preventDefault();

    const zoomStrength = 0.2;
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const mapX = (mouseX - offsetX) / scale;
    const mapY = (mouseY - offsetY) / scale;

    scale *= e.deltaY > 0 ? 1 - zoomStrength : 1 + zoomStrength;
    scale = Math.min(Math.max(scale, 0.1), 10);

    offsetX = mouseX - mapX * scale;
    offsetY = mouseY - mapY * scale;

    clampOffsets();
    draw();
});
