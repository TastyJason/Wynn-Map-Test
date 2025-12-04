// Setup canvas
const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Load the map image
const mapImg = new Image();
mapImg.src = "map.png"; // ensure filename matches

// Map state
let scale = 1;
let offsetX = 0;
let offsetY = 0;

// Drag state
let dragging = false;
let lastX = 0;
let lastY = 0;

// ------------------------------
// ADD: clampOffsets() function
// ------------------------------
function clampOffsets() {
  const imgW = mapImg.naturalWidth;
  const imgH = mapImg.naturalHeight;

  if (!imgW || !imgH) return; // image not loaded yet

  const maxOffsetX = 0;
  const maxOffsetY = 0;
  const minOffsetX = canvas.width - imgW * scale;
  const minOffsetY = canvas.height - imgH * scale;

  // Center if map is smaller than canvas
  if (minOffsetX > maxOffsetX)
    offsetX = (canvas.width - imgW * scale) / 2;
  else
    offsetX = Math.min(maxOffsetX, Math.max(minOffsetX, offsetX));

  if (minOffsetY > maxOffsetY)
    offsetY = (canvas.height - imgH * scale) / 2;
  else
    offsetY = Math.min(maxOffsetY, Math.max(minOffsetY, offsetY));
}

// Draw function
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Prevent scrolling from locking too early
  const mapW = mapImg.width * scale;
  const mapH = mapImg.height * scale;

  if (mapW > canvas.width) {
    offsetX = Math.min(offsetX, 0);
    offsetX = Math.max(offsetX, canvas.width - mapW);
  } else {
    offsetX = (canvas.width - mapW) / 2; // center when smaller
  }

  if (mapH > canvas.height) {
    offsetY = Math.min(offsetY, 0);
    offsetY = Math.max(offsetY, canvas.height - mapH);
  } else {
    offsetY = (canvas.height - mapH) / 2; // center when smaller
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
    lastX = e.clientX;
    lastY = e.clientY;

    clampOffsets();
    draw();
  }

  // UPDATE LIVE COORD DISPLAY
  const mapX = Math.round((e.clientX - offsetX) / scale);
  const mapY = Math.round((e.clientY - offsetY) / scale);
  coordDisplay.textContent = `${mapX}, ${mapY}`;
});

canvas.addEventListener("mouseup", () => dragging = false);
canvas.addEventListener("mouseleave", () => dragging = false);

// Click coordinates
canvas.addEventListener("click", (e) => {
  const x = (e.clientX - offsetX) / scale;
  const y = (e.clientY - offsetY) / scale;
  console.log("Map clicked at:", x, y);
});

// Zoom toward cursor with adjustable increment
canvas.addEventListener("wheel", (e) => {
  e.preventDefault(); // prevent page scroll

  const zoomStrength = 0.2;
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  // Map coords at cursor
  const mapX = (mouseX - offsetX) / scale;
  const mapY = (mouseY - offsetY) / scale;

  // Update scale
  scale *= e.deltaY > 0 ? 1 - zoomStrength : 1 + zoomStrength;
  scale = Math.min(Math.max(scale, 0.1), 10);

  // Adjust offset so the cursor stays fixed
  offsetX = mouseX - mapX * scale;
  offsetY = mouseY - mapY * scale;

  clampOffsets();
  draw();
});

canvas.addEventListener("mousemove", (e) => {
    if (dragging) return;

    const x = ((e.clientX - offsetX) / scale).toFixed(1);
    const y = ((e.clientY - offsetY) / scale).toFixed(1);

    coordDisplay.textContent = `${x}, ${y}`;
});


// ADD: Floating single-coordinate display 

const coordDisplay = document.createElement("div");
coordDisplay.id = "coordDisplay";

coordDisplay.style.position = "fixed";
coordDisplay.style.left = "50%";
coordDisplay.style.bottom = "20px";
coordDisplay.style.transform = "translateX(-50%)";

coordDisplay.style.fontSize = "22px";   // smaller
coordDisplay.style.fontWeight = "bold";
coordDisplay.style.fontFamily = "monospace";

coordDisplay.style.padding = "4px 10px";
coordDisplay.style.background = "rgba(0,0,0,0.45)";
coordDisplay.style.color = "white";
coordDisplay.style.borderRadius = "6px";
coordDisplay.style.pointerEvents = "none";
coordDisplay.style.zIndex = "9999";
