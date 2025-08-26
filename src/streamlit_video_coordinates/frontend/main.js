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

  // Calculate coordinates relative to the video element box (includes any letterboxing)
  const rect = video.getBoundingClientRect();
  const clickX = event.clientX - rect.left; // relative to element box
  const clickY = event.clientY - rect.top;

  // Intrinsic (natural) video dimensions – required for correct pixel mapping
  const intrinsicW = video.videoWidth;
  const intrinsicH = video.videoHeight;

  if (!intrinsicW || !intrinsicH) {
    // Metadata not loaded yet; abort to avoid returning bogus coordinates based on CSS box
    console.warn("Video metadata not loaded; ignoring click for coordinate accuracy");
    return;
  }

  // Compute how the intrinsic video is letterboxed inside the displayed element.
  // The browser scales the video uniformly so that it fits within rect while preserving aspect ratio.
  const scale = Math.min(rect.width / intrinsicW, rect.height / intrinsicH); // uniform scale applied
  const displayedContentW = intrinsicW * scale;
  const displayedContentH = intrinsicH * scale;
  const offsetX = (rect.width - displayedContentW) / 2;  // horizontal letterbox (left bar width)
  const offsetY = (rect.height - displayedContentH) / 2; // vertical letterbox (top bar height)

  // Coordinates inside the actual displayed video content (exclude letterbox bars)
  const withinContentX = clickX - offsetX;
  const withinContentY = clickY - offsetY;

  // Ignore clicks that land on the letterbox bars (outside actual video pixels)
  if (withinContentX < 0 || withinContentY < 0 || withinContentX > displayedContentW || withinContentY > displayedContentH) {
    console.log("Click ignored (outside displayed video content area)");
    return;
  }

  // Map back to intrinsic pixel coordinates
  const x = withinContentX / scale;
  const y = withinContentY / scale;

  console.log(
    `Coordinate mapping: displayBox(${clickX.toFixed(2)}, ${clickY.toFixed(2)}) -> content(${withinContentX.toFixed(2)}, ${withinContentY.toFixed(2)}) -> intrinsic(${x.toFixed(2)}, ${y.toFixed(2)}) | intrinsic=${intrinsicW}x${intrinsicH} displayBox=${rect.width.toFixed(1)}x${rect.height.toFixed(1)} content=${displayedContentW.toFixed(1)}x${displayedContentH.toFixed(1)} offsets=(${offsetX.toFixed(1)}, ${offsetY.toFixed(1)}) scale=${scale.toFixed(4)}`
  );

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
    width: intrinsicW,
    height: intrinsicH,
    unix_time: unixTime
  };

  clickEvents.push(clickData);

  // Add visual marker at the actual element box coordinates so it appears where user clicked
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
  let { src, height, width, start_time } = event.detail.args;

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
    video.onerror = function (e) {
      console.error("Failed to load video:", src, e);
      // Still show the video element with controls for user feedback
      // Add a visual indicator that the video failed to load
      video.style.backgroundColor = "#000";
      video.style.position = "relative";
    };

    video.onloadstart = function () {
      console.log("Started loading video:", src);
    };

    video.oncanplay = function () {
      console.log("Video ready to play");
      // Clear any error styling
      video.style.backgroundColor = "";
    };

    video.onloadedmetadata = function () {
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
    video.onplay = function () {
      video.style.cursor = "default";
      // Clear all visual markers when video starts playing
      clearMarkers();
    };

    video.onpause = function () {
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