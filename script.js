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

// Draw function
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
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
  if (!dragging) return;
  offsetX += e.clientX - lastX;
  offsetY += e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;
  draw();
});

canvas.addEventListener("mouseup", () => dragging = false);
canvas.addEventListener("mouseleave", () => dragging = false);

// Click coordinates
canvas.addEventListener("click", (e) => {
  const x = (e.clientX - offsetX) / scale;
  const y = (e.clientY - offsetY) / scale;
  console.log("Map clicked at:", x, y);
});

// Zoom toward cursor
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();

  const zoomStrength = 0.3;
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  // Get the point on the map under the cursor
  const mapX = (mouseX - offsetX) / scale;
  const mapY = (mouseY - offsetY) / scale;

  // Update scale
  scale *= e.deltaY > 0 ? 1 - zoomStrength : 1 + zoomStrength;
  scale = Math.min(Math.max(scale, 0.1), 10); // adjust min/max zoom

  // Recalculate offset so the point under cursor stays fixed
  offsetX = mouseX - mapX * scale;
  offsetY = mouseY - mapY * scale;

  draw();
});
