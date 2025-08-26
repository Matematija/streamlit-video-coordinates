#!/usr/bin/env python3
"""Test script to validate the two specific bugs mentioned in the problem statement"""

import streamlit as st
from streamlit_video_coordinates import streamlit_video_coordinates

st.set_page_config(page_title="Bug Testing", layout="wide")

st.title("🐛 Bug Testing for Video Coordinates")

st.markdown("""
## Testing Two Specific Bugs:

### Bug 1: Coordinate scaling with custom width/height
- When width or height is specified, coordinates should be in original video pixels
- NOT in scaled video pixels

### Bug 2: Video resets on first click
- Video should NOT reset to beginning (frame 0) on first click
- Should stay at current time position when clicked
""")

# Create a simple test with local video
col1, col2 = st.columns([2, 1])

with col1:
    st.subheader("Test Video (640x360 scaled)")
    st.write("Testing with custom width=640, height=360")
    
    # Test URL that might work locally
    test_url = "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
    
    # Use streamlit_video_coordinates with custom dimensions
    clicks = streamlit_video_coordinates(
        test_url, 
        key="test_video", 
        width=640, 
        height=360
    )

with col2:
    st.subheader("Bug Analysis")
    
    if clicks:
        st.write(f"**Total clicks: {len(clicks)}**")
        
        for i, click in enumerate(clicks):
            with st.expander(f"Click {i+1}"):
                st.write(f"**Coordinates:** ({click['x']}, {click['y']})")
                st.write(f"**Frame Time:** {click['frame_time']:.3f}s")
                st.write(f"**Video Size:** {click.get('width', 'N/A')} × {click.get('height', 'N/A')}")
                
                # Bug 1 check: coordinates should be in original video dimensions
                if 'width' in click and 'height' in click:
                    video_w, video_h = click['width'], click['height']
                    display_w, display_h = 640, 360
                    
                    if video_w != display_w or video_h != display_h:
                        # Check if coordinates are in video range vs display range
                        coord_in_video_range = 0 <= click['x'] <= video_w and 0 <= click['y'] <= video_h
                        coord_in_display_range = 0 <= click['x'] <= display_w and 0 <= click['y'] <= display_h
                        
                        if coord_in_video_range and not coord_in_display_range:
                            st.success("✅ Bug 1: Coordinates correctly in video dimensions")
                        elif coord_in_display_range and not coord_in_video_range:
                            st.error("❌ Bug 1: Coordinates incorrectly in display dimensions")
                        else:
                            st.warning("? Bug 1: Coordinates range unclear")
                
                # Bug 2 check: note if frame time resets
                if i == 0 and click['frame_time'] == 0:
                    st.warning("⚠️ Bug 2: First click might indicate video reset (time=0)")
                elif i == 0 and click['frame_time'] > 0:
                    st.success("✅ Bug 2: First click preserves video time")
    else:
        st.info("Click on the paused video to test bugs")

# Add manual testing instructions
st.markdown("---")
st.subheader("Manual Testing Steps")
st.markdown("""
1. **For Bug 1 (Coordinate Scaling):**
   - Note the video's actual dimensions vs display dimensions (640x360)
   - Click on different parts of the video
   - Check if coordinates are in original video pixel space

2. **For Bug 2 (Video Reset):**
   - Play the video and pause it at a time > 0 seconds
   - Click on the video
   - Check if the video jumps back to 0 seconds (bug) or stays at current time (correct)
""")