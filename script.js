// Setup canvas
const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Load the map image
const mapImg = new Image();
mapImg.src = "map.png"; // make sure the filename matches exactly

// Map state
let scale = 1;
let targetScale = 1;
let offsetX = 0;
let offsetY = 0;

// Dragging state
let dragging = false;
let lastX, lastY;

// Zoom animation speed
const zoomSpeed = 0.2;

// Store zoom target offset to interpolate
let zoomOffsetX = 0;
let zoomOffsetY = 0;

// Draw the map
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);
  ctx.drawImage(mapImg, 0, 0);
  ctx.restore();
}

// Animate loop
function animate() {
  // Smoothly interpolate scale
  const prevScale = scale;
  scale += (targetScale - scale) * zoomSpeed;

  // Smoothly adjust offset to keep cursor point fixed
  offsetX += (zoomOffsetX - offsetX) * zoomSpeed;
  offsetY += (zoomOffsetY - offsetY) * zoomSpeed;

  draw();
  requestAnimationFrame(animate);
}

// Start animation loop
animate();

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

// Zoom with wheel toward cursor
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();

  const zoomStrength = 0.1;
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  // Map coordinates before zoom
  const xBeforeZoom = (mouseX - offsetX) / scale;
  const yBeforeZoom = (mouseY - offsetY) / scale;

  // Update target scale
  targetScale += e.deltaY > 0 ? -zoomStrength : zoomStrength;
  targetScale = Math.min(Math.max(targetScale, 0.1), 10);

  // Calculate new offset to keep cursor fixed
  zoomOffsetX = mouseX - xBeforeZoom * targetScale;
  zoomOffsetY = mouseY - yBeforeZoom * targetScale;
});
