// The `Streamlit` object exists because our html file includes
// `streamlit-component-lib.js`.

// Store all click events
let clickEvents = [];

function sendValue() {
  Streamlit.setComponentValue(clickEvents)
}

/**
 * Add a visual marker at the click position
 */
function addClickMarker(x, y, frameTime, frameIndex) {
  const overlay = document.getElementById("click-overlay");
  
  // Create marker dot
  const marker = document.createElement("div");
  marker.className = "click-marker";
  marker.style.left = x + "px";
  marker.style.top = y + "px";
  
  // Create label with frame info
  const label = document.createElement("div");
  label.className = "click-label";
  label.style.left = x + "px";
  label.style.top = y + "px";
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
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;
  
  // Ensure coordinates are within video bounds
  if (clickX < 0 || clickY < 0 || clickX > rect.width || clickY > rect.height) {
    return;
  }
  
  // Scale coordinates to match actual video dimensions
  // This ensures coordinates are consistent regardless of display size
  let x = clickX;
  let y = clickY;
  let videoWidth = video.videoWidth;
  let videoHeight = video.videoHeight;
  
  // Determine the reference video dimensions for scaling
  if (video.videoWidth && video.videoHeight) {
    // Video metadata is available - use actual video dimensions
    videoWidth = video.videoWidth;
    videoHeight = video.videoHeight;
  } else if (customWidth && customHeight) {
    // Video metadata not available but custom dimensions provided - use custom dimensions
    videoWidth = customWidth;
    videoHeight = customHeight;
    console.log(`Using custom dimensions for coordinate scaling: ${customWidth}x${customHeight}`);
  } else {
    // No video metadata and no custom dimensions - fallback to display dimensions
    videoWidth = rect.width;
    videoHeight = rect.height;
    console.warn("No video or custom dimensions available - using display dimensions for coordinates");
  }
  
  // Perform coordinate scaling if we have valid dimensions
  if (videoWidth && videoHeight && rect.width && rect.height && 
      (videoWidth !== rect.width || videoHeight !== rect.height)) {
    const scaleX = videoWidth / rect.width;
    const scaleY = videoHeight / rect.height;
    x = clickX * scaleX;
    y = clickY * scaleY;
    console.log(`Coordinate scaling: display(${clickX.toFixed(2)}, ${clickY.toFixed(2)}) -> video(${x.toFixed(2)}, ${y.toFixed(2)}) | scales(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)}) | reference size: ${videoWidth}x${videoHeight} | display size: ${rect.width.toFixed(1)}x${rect.height.toFixed(1)}`);
  } else {
    console.log(`No coordinate scaling needed: reference(${videoWidth}x${videoHeight}) = display(${rect.width.toFixed(1)}x${rect.height.toFixed(1)})`);
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
  
  // Store the click event with actual video coordinates
  const clickData = {
    x: Math.round(x),
    y: Math.round(y),
    frame_time: frameTime,
    frame_index: frameIndex,
    width: videoWidth || rect.width,
    height: videoHeight || rect.height,
    unix_time: unixTime
  };
  
  clickEvents.push(clickData);
  
  // Add visual marker using display coordinates (not scaled)
  addClickMarker(clickX, clickY, frameTime, frameIndex);
  
  // Send updated data to Streamlit
  sendValue();
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
}

// Store the custom dimensions for coordinate scaling
let customWidth = null;
let customHeight = null;

/**
 * The component's render function. This will be called immediately after
 * the component is initially loaded, and then again every time the
 * component gets new data from Python.
 */
function onRender(event) {
  let {src, height, width, start_time} = event.detail.args;
  
  // Store custom dimensions for coordinate scaling
  customWidth = width;
  customHeight = height;
  
  const video = document.getElementById("video");
  const container = document.getElementById("video-container");
  
  // Ensure video element has controls
  video.setAttribute('controls', 'true');
  video.setAttribute('controlslist', 'nofullscreen');
  
  // Preserve current video time before any changes
  const currentTime = video.currentTime || 0;
  
  // Update video source if changed
  const videoSourceChanged = video.src !== src;
  if (videoSourceChanged) {
    video.src = src;
    // Clear previous click events when video changes
    clickEvents = [];
    clearMarkers();
    
    // Handle video load errors
    video.onerror = function(e) {
      console.error("Failed to load video:", src, e);
      // Still show the video element with controls for user feedback
      // Add a visual indicator that the video failed to load
      video.style.backgroundColor = "#000";
      video.style.position = "relative";
    };
    
    video.onloadstart = function() {
      console.log("Started loading video:", src);
    };
    
    video.oncanplay = function() {
      console.log("Video ready to play");
      // Clear any error styling
      video.style.backgroundColor = "";
    };
    
    video.onloadedmetadata = function() {
      console.log("Video metadata loaded");
      updateFrameHeight();
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
  
  // Update frame height for Streamlit
  function updateFrameHeight() {
    const rect = video.getBoundingClientRect();
    Streamlit.setFrameHeight(rect.height);
    updateOverlaySize();
  }
  
  // Only set up event handlers when video source changes or on initial load
  if (videoSourceChanged || !video.onclick) {
    video.onloadedmetadata = updateFrameHeight;
    video.onresize = updateFrameHeight;
    window.addEventListener("resize", updateFrameHeight);
    
    // Add click listener
    video.onclick = clickListener;
    
    // Update overlay on video time changes
    video.ontimeupdate = updateOverlaySize;
    
    // Show/hide cursor based on video state
    video.onplay = function() {
      video.style.cursor = "default";
      // Clear all visual markers when video starts playing
      clearMarkers();
    };
    
    video.onpause = function() {
      video.style.cursor = "crosshair";
    };
  }
  
  // Set start time if specified (only for new videos or initial load)
  if (videoSourceChanged && start_time && start_time > 0) {
    video.currentTime = start_time;
  } else if (!videoSourceChanged && currentTime > 0) {
    // Preserve current time during re-renders
    video.currentTime = currentTime;
  }
  
  // Initial setup
  updateFrameHeight();
}

// Event listeners
Streamlit.events.addEventListener(Streamlit.RENDER_EVENT, onRender);
Streamlit.setComponentReady();