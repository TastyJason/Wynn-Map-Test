// Setup canvas
const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Load the map image
const mapImg = new Image();
mapImg.src = "map.png"; // make sure the filename matches EXACTLY

// Map view state
let scale = 1;
let offsetX = 0;
let offsetY = 0;

// Dragging state
let dragging = false;
let lastX, lastY;

// Draw the map
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  ctx.drawImage(mapImg, 0, 0);

  ctx.restore();
}

mapImg.onload = draw;

// Zoom with the mouse wheel
canvas.addEventListener("wheel", (e) => {
  const zoomStrength = 0.1;
  const direction = e.deltaY > 0 ? -zoomStrength : zoomStrength;

  scale += direction;
  scale = Math.min(Math.max(scale, 0.3), 4); // limit zoom

  draw();
});

// Start dragging
canvas.addEventListener("mousedown", (e) => {
  dragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
});

// Drag to pan
canvas.addEventListener("mousemove", (e) => {
  if (!dragging) return;

  offsetX += e.clientX - lastX;
  offsetY += e.clientY - lastY;

  lastX = e.clientX;
  lastY = e.clientY;

  draw();
});

// Stop drag
canvas.addEventListener("mouseup", () => dragging = false);
canvas.addEventListener("mouseleave", () => dragging = false);

// Click to get map coordinates
canvas.addEventListener("click", (e) => {
  const x = (e.clientX - offsetX) / scale;
  const y = (e.clientY - offsetY) / scale;

  console.log("Map clicked at:", x, y);
});
