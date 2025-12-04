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

// Clamp offsets
function clampOffsets() {
  const imgW = mapImg.naturalWidth;
  const imgH = mapImg.naturalHeight;

  if (!imgW || !imgH) return;

  const maxOffsetX = 0;
  const maxOffsetY = 0;
  const minOffsetX = canvas.width - imgW * scale;
  const minOffsetY = canvas.height - imgH * scale;

  if (minOffsetX > maxOffsetX)
    offsetX = (canvas.width - imgW * scale) / 2;
  else
    offsetX = Math.min(maxOffsetX, Math.max(minOffsetX, offsetX));

  if (minOffsetY > maxOffsetY)
    offsetY = (canvas.height - imgH * scale) / 2;
  else
    offsetY = Math.min(maxOffsetY, Math.max(minOffsetY, offsetY));
}

// Draw
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const mapW = mapImg.width * scale;
  const mapH = mapImg.height * scale;

  if (mapW > canvas.width) {
    offsetX = Math.min(offsetX, 0);
    offsetX = Math.max(offsetX, canvas.width - mapW);
  } else {
    offsetX = (canvas.width - mapW) / 2;
  }

  if (mapH > canvas.height) {
    offsetY = Math.min(offsetY, 0);
    offsetY = Math.max(offsetY, canvas.height - mapH);
  } else {
    offsetY = (canvas.height - mapH) / 2;
  }

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);
  ctx.drawImage(mapImg, 0, 0);
  ctx.restore();
}

mapImg.onload = draw;

// Dragging
canvas.addEventListener("mousedown", (e) => {
  dragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
});

canvas.addEventListener("mousemove", (e) => {
  if (dragging) {
    offsetX += e.clientX - lastX;
    offsetY += e.clientY - lastY;
