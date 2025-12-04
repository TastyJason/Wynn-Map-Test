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

//prevent scrolling from locking too early
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
  if (!dragging) return;
  offsetX += e.clientX - lastX;
  offsetY += e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;

  clampOffsets(); // <-- ADDED
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

  clampOffsets(); // <-- ADDED
  draw();
});
// -----------------------------
// LIVE COORDINATE DISPLAY (append to end of script.js)
// -----------------------------

// If your "true" high-res map is 4091x6485 but the displayed image is smaller,
// set these. If you want to use the image as-is, set REFERENCE_WIDTH = mapImg.naturalWidth etc.
const REFERENCE_WIDTH = 4091;   // set to your real map width (or set to mapImg.naturalWidth)
const REFERENCE_HEIGHT = 6485;  // set to your real map height (or set to mapImg.naturalHeight)

// Optional: provide a function to convert original-image pixels -> Wynncraft coords.
// Replace the body of this function after you have the affine transform (SCALE + OFFSET).
// For now it returns null (not computed).
function toWynnCoords(origX, origY) {
  // EXAMPLE placeholder:
  // return { X: origX * 1 + 0, Z: origY * 1 + 0 };
  // Replace with actual mapping once you have scale/offset or affine matrix.
  return null;
}

// Create overlay element (no HTML changes required)
const coordOverlay = document.createElement("div");
coordOverlay.style.position = "fixed";
coordOverlay.style.left = "12px";
coordOverlay.style.bottom = "12px";
coordOverlay.style.padding = "6px 8px";
coordOverlay.style.background = "rgba(0,0,0,0.6)";
coordOverlay.style.color = "#fff";
coordOverlay.style.fontFamily = "monospace";
coordOverlay.style.fontSize = "13px";
coordOverlay.style.borderRadius = "6px";
coordOverlay.style.pointerEvents = "none"; // don't block mouse
coordOverlay.style.zIndex = 9999;
coordOverlay.innerHTML = "x: — y: —";
document.body.appendChild(coordOverlay);

// Helper: convert displayed image pixel -> reference/original pixel
function displayedToOriginal(px, py) {
  // use naturalWidth/naturalHeight when available (actual file dimensions)
  const srcW = mapImg.naturalWidth || mapImg.width || REFERENCE_WIDTH;
  const srcH = mapImg.naturalHeight || mapImg.height || REFERENCE_HEIGHT;

  // If your reference is different from the file, scale up to REFERENCE values:
  const sx = (REFERENCE_WIDTH  && srcW) ? (REFERENCE_WIDTH  / srcW) : 1;
  const sy = (REFERENCE_HEIGHT && srcH) ? (REFERENCE_HEIGHT / srcH) : 1;

  return {
    ox: px * sx,
    oy: py * sy,
    srcW,
    srcH,
    sx, sy
  };
}

// Update overlay text
function updateOverlayText(e) {
  if (!mapImg || (!mapImg.naturalWidth && !mapImg.width)) return;

  // Displayed image pixel (image-space, independent of zoom/pan)
  const dispX = (e.clientX - offsetX) / scale;
  const dispY = (e.clientY - offsetY) / scale;

  // If mouse is outside the image area, show dashes
  const imgW = (mapImg.naturalWidth || mapImg.width);
  const imgH = (mapImg.naturalHeight || mapImg.height);
  const inside = dispX >= 0 && dispY >= 0 && dispX <= imgW && dispY <= imgH;

  const dispXstr = inside ? Math.round(dispX) : "—";
  const dispYstr = inside ? Math.round(dispY) : "—";

  // Convert to reference/original image pixels (e.g. 4091x6485)
  const orig = displayedToOriginal(dispX, dispY);
  const origXstr = (inside && orig.ox!=null) ? Math.round(orig.ox) : "—";
  const origYstr = (inside && orig.oy!=null) ? Math.round(orig.oy) : "—";

  // Optionally compute Wynncraft coords (if toWynnCoords is implemented)
  let wynnText = "";
  const w = toWynnCoords(orig.ox, orig.oy);
  if (w && typeof w.X !== "undefined") {
    wynnText = `<br>Wynn X: ${Math.round(w.X)} Z: ${Math.round(w.Z)}`;
  } else {
    wynnText = `<br>Wynn: (not configured)`;
  }

  coordOverlay.innerHTML =
    `Disp: ${dispXstr}, ${dispYstr}<br>` +
    `Orig: ${origXstr}, ${origYstr}` +
    wynnText;
}

// Show/hide overlay based on pointer
canvas.addEventListener("mousemove", (e) => {
  updateOverlayText(e);
});

canvas.addEventListener("mouseleave", () => {
  coordOverlay.innerHTML = "x: — y: —";
});
