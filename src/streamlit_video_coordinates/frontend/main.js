// The `Streamlit` object exists because our html file includes
// `streamlit-component-lib.js`.

// Store all click events
let clickEvents = [];
let isFullscreen = false;
let fullscreenOverlay = null;

function sendValue() {
  Streamlit.setComponentValue(clickEvents)
}

/**
 * Get the appropriate overlay element (normal or fullscreen)
 */
function getOverlay() {
  if (isFullscreen && fullscreenOverlay) {
    return fullscreenOverlay;
  }
  return document.getElementById("click-overlay");
}

/**
 * Create fullscreen overlay
 */
function createFullscreenOverlay() {
  if (fullscreenOverlay) {
    return fullscreenOverlay;
  }
  
  fullscreenOverlay = document.createElement("div");
  fullscreenOverlay.id = "fullscreen-overlay";
  fullscreenOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 9999;
  `;
  
  return fullscreenOverlay;
}

/**
 * Remove fullscreen overlay
 */
function removeFullscreenOverlay() {
  if (fullscreenOverlay && fullscreenOverlay.parentNode) {
    fullscreenOverlay.parentNode.removeChild(fullscreenOverlay);
  }
  fullscreenOverlay = null;
}

/**
 * Add a visual marker at the click position
 */
/**
 * Add a visual marker at the click position
 */
function addClickMarker(x, y, frameTime, frameIndex) {
  let overlay, actualX, actualY;
  
  if (isFullscreen) {
    // In fullscreen, use fullscreen overlay and absolute positioning
    overlay = getOverlay();
    const video = document.getElementById("video");
    const videoRect = video.getBoundingClientRect();
    actualX = videoRect.left + x;
    actualY = videoRect.top + y;
  } else {
    // In normal mode, use relative positioning within video container
    overlay = getOverlay();
    actualX = x;
    actualY = y;
  }
  
  // Create marker dot
  const marker = document.createElement("div");
  marker.className = "click-marker";
  marker.style.left = actualX + "px";
  marker.style.top = actualY + "px";
  
  // Create label with frame info
  const label = document.createElement("div");
  label.className = "click-label";
  label.style.left = actualX + "px";
  label.style.top = actualY + "px";
  label.textContent = `${frameTime.toFixed(2)}s (f:${frameIndex})`;
  
  overlay.appendChild(marker);
  overlay.appendChild(label);
}

/**
 * Clear all visual markers
 */
function clearMarkers() {
  const overlay = document.getElementById("click-overlay");
  overlay.innerHTML = "";
  
  // Also clear fullscreen overlay if it exists
  if (fullscreenOverlay) {
    fullscreenOverlay.innerHTML = "";
  }
}

/**
 * Handle video click events
 */
function clickListener(event) {
  const video = document.getElementById("video");
  
  // Only capture clicks when video is paused
  if (!video.paused) {
    return;
  }
  
  // Prevent the default click behavior (play/pause) when video is paused
  event.preventDefault();
  event.stopPropagation();
  
  // Calculate coordinates relative to video element
  const rect = video.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  // Ensure coordinates are within video bounds
  if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
    return;
  }
  
  // Get current video time and estimated frame index
  const frameTime = video.currentTime;
  // Try to get actual frame rate from video, fallback to 30fps
  let frameRate = 30;
  if (video.videoHeight && video.videoWidth) {
    // For most web videos, 30fps is a reasonable default
    // In a production environment, you might want to detect this more accurately
    frameRate = 30;
  }
  const frameIndex = Math.floor(frameTime * frameRate);
  
  const unixTime = Date.now();
  
  // Store the click event
  const clickData = {
    x: Math.round(x),
    y: Math.round(y),
    frame_time: frameTime,
    frame_index: frameIndex,
    width: video.videoWidth,
    height: video.videoHeight,
    unix_time: unixTime
  };
  
  clickEvents.push(clickData);
  
  // Add visual marker
  addClickMarker(x, y, frameTime, frameIndex);
  
  // Send updated data to Streamlit
  sendValue();
}

/**
 * Handle fullscreen changes
 */
function handleFullscreenChange() {
  const video = document.getElementById("video");
  
  // Check if we're in fullscreen mode
  isFullscreen = !!(document.fullscreenElement || 
                    document.webkitFullscreenElement || 
                    document.mozFullScreenElement || 
                    document.msFullscreenElement);
  
  if (isFullscreen) {
    // Create and add fullscreen overlay
    const overlay = createFullscreenOverlay();
    document.body.appendChild(overlay);
    
    // Recreate existing markers for fullscreen
    recreateMarkersForFullscreen();
  } else {
    // Remove fullscreen overlay and recreate markers in normal overlay
    removeFullscreenOverlay();
    recreateMarkersForNormal();
  }
}

/**
 * Recreate markers for fullscreen mode
 */
function recreateMarkersForFullscreen() {
  if (!isFullscreen || !fullscreenOverlay) return;
  
  const video = document.getElementById("video");
  const videoRect = video.getBoundingClientRect();
  const normalOverlay = document.getElementById("click-overlay");
  
  // Clear fullscreen overlay
  fullscreenOverlay.innerHTML = "";
  
  // Copy markers from normal overlay to fullscreen overlay with adjusted positions
  const markers = normalOverlay.querySelectorAll('.click-marker');
  const labels = normalOverlay.querySelectorAll('.click-label');
  
  markers.forEach((marker, index) => {
    const normalX = parseFloat(marker.style.left);
    const normalY = parseFloat(marker.style.top);
    
    const newMarker = marker.cloneNode(true);
    newMarker.style.left = (videoRect.left + normalX) + "px";
    newMarker.style.top = (videoRect.top + normalY) + "px";
    
    fullscreenOverlay.appendChild(newMarker);
  });
  
  labels.forEach((label, index) => {
    const normalX = parseFloat(label.style.left);
    const normalY = parseFloat(label.style.top);
    
    const newLabel = label.cloneNode(true);
    newLabel.style.left = (videoRect.left + normalX) + "px";
    newLabel.style.top = (videoRect.top + normalY) + "px";
    
    fullscreenOverlay.appendChild(newLabel);
  });
}

/**
 * Recreate markers for normal mode
 */
function recreateMarkersForNormal() {
  // Clear and recreate markers in normal overlay from click events data
  const normalOverlay = document.getElementById("click-overlay");
  normalOverlay.innerHTML = "";
  
  // Recreate all markers from stored click events
  clickEvents.forEach(clickData => {
    const marker = document.createElement("div");
    marker.className = "click-marker";
    marker.style.left = clickData.x + "px";
    marker.style.top = clickData.y + "px";
    
    const label = document.createElement("div");
    label.className = "click-label";
    label.style.left = clickData.x + "px";
    label.style.top = clickData.y + "px";
    label.textContent = `${clickData.frame_time.toFixed(2)}s (f:${clickData.frame_index})`;
    
    normalOverlay.appendChild(marker);
    normalOverlay.appendChild(label);
  });
}

/**
 * Update the overlay size when video is resized
 */
function updateOverlaySize() {
  const video = document.getElementById("video");
  const overlay = document.getElementById("click-overlay");
  
  const rect = video.getBoundingClientRect();
  overlay.style.width = rect.width + "px";
  overlay.style.height = rect.height + "px";
  
  // Update fullscreen markers if in fullscreen mode
  if (isFullscreen) {
    recreateMarkersForFullscreen();
  }
}

/**
 * The component's render function. This will be called immediately after
 * the component is initially loaded, and then again every time the
 * component gets new data from Python.
 */
function onRender(event) {
  let {src, height, width, start_time} = event.detail.args;
  
  const video = document.getElementById("video");
  const container = document.getElementById("video-container");
  
  // Update video source if changed
  if (video.src !== src) {
    video.src = src;
    // Clear previous click events when video changes
    clickEvents = [];
    clearMarkers();
    
    // Handle video load errors
    video.onerror = function() {
      console.error("Failed to load video:", src);
    };
    
    video.oncanplay = function() {
      console.log("Video ready to play");
    };
  }
  
  // Set video dimensions
  if (width) {
    video.style.width = width + "px";
    video.style.maxWidth = width + "px";
  } else {
    video.style.width = "100%";
    video.style.maxWidth = "100%";
  }
  
  if (height) {
    video.style.height = height + "px";
    video.style.maxHeight = height + "px";
  } else {
    video.style.height = "auto";
    video.style.maxHeight = "none";
  }
  
  // Set start time if specified
  if (start_time && start_time > 0) {
    video.currentTime = start_time;
  }
  
  // Update frame height for Streamlit
  function updateFrameHeight() {
    const rect = video.getBoundingClientRect();
    Streamlit.setFrameHeight(rect.height);
    updateOverlaySize();
  }
  
  video.onloadedmetadata = updateFrameHeight;
  video.onresize = updateFrameHeight;
  window.addEventListener("resize", updateFrameHeight);
  
  // Add click listener
  video.onclick = clickListener;
  
  // Add fullscreen change listeners
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  document.addEventListener('MSFullscreenChange', handleFullscreenChange);
  
  // Update overlay on video time changes
  video.ontimeupdate = updateOverlaySize;
  
  // Show/hide cursor based on video state
  video.onplay = function() {
    video.style.cursor = "default";
  };
  
  video.onpause = function() {
    video.style.cursor = "crosshair";
  };
  
  // Initial setup
  updateFrameHeight();
}

// Event listeners
Streamlit.events.addEventListener(Streamlit.RENDER_EVENT, onRender);
Streamlit.setComponentReady();