# streamlit-video-coordinates

A Streamlit component that displays a video and captures coordinates when you click on paused frames.

This component was needed for a webpage I was making so I decided to extract it into a reusable package. It was made with a lot of help from AI code generation. If you find any bugs, feel free to do a PR.

## Features

- 📹 Support for multiple video formats (MP4, WebM, OGG, AVI, MOV)
- 🖱️ Click on paused video frames to capture pixel coordinates
- 📊 Get frame time and estimated frame index for each click
- 🎯 Visual click markers with frame information
- 📁 Support for file upload and URL input
- 💾 Persistent click data across interactions

## Installation

```bash
pip install git+https://github.com/Matematija/streamlit-video-coordinates.git
```

## Quick Start

```python
import streamlit as st
from streamlit_video_coordinates import streamlit_video_coordinates

# Upload a video file
uploaded_file = st.file_uploader("Choose a video", type=['mp4', 'webm', 'ogg'])

if uploaded_file:
    # Display video and capture clicks
    clicks = streamlit_video_coordinates(uploaded_file, key="video")
    
    # Display click data
    for i, click in enumerate(clicks):
        st.write(f"Click {i+1}: ({click['x']}, {click['y']}) at {click['frame_time']:.2f}s")
```

## Usage

### Basic Usage

```python
clicks = streamlit_video_coordinates(
    source="path/to/video.mp4",  # Video source
    key="my_video",              # Unique key
    width=640,                   # Video width
    height=360                   # Video height
)
```

### Input Sources

The component supports various video sources:

```python
# Local file path
clicks = streamlit_video_coordinates("./my_video.mp4")

# URL
clicks = streamlit_video_coordinates("https://example.com/video.mp4")

# File upload
uploaded = st.file_uploader("Video", type=['mp4'])
clicks = streamlit_video_coordinates(uploaded)

# Raw bytes
with open("video.mp4", "rb") as f:
    clicks = streamlit_video_coordinates(f.read())
```

### Return Data

Each click returns a dictionary with:

```python
{
    'x': 320,                    # X coordinate (pixels)
    'y': 240,                    # Y coordinate (pixels)
    'frame_time': 15.5,          # Video time (seconds)
    'frame_index': 465,          # Estimated frame number
    'width': 1280,               # Video width (pixels)
    'height': 720,               # Video height (pixels)
    'unix_time': 1234567890      # Click timestamp
}
```

## Parameters

- `source`: Video source (file path, URL, bytes, or file-like object)
- `height`: Video height in pixels (optional)
- `width`: Video width in pixels (optional)
- `key`: Unique component key (optional)
- `on_click`: Callback function for clicks (optional)
- `start_time`: Video start time in seconds (optional)

## Demo

Run the demo application:

```bash
streamlit run streamlit_app.py
```

## Development

1. Clone the repository
2. Install dependencies: `pip install -e .`
3. Run the demo: `streamlit run streamlit_app.py`