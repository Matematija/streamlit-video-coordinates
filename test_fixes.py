#!/usr/bin/env python3
"""
Simple test to verify the video coordinate bugs are fixed
"""

import streamlit as st
from streamlit_video_coordinates import streamlit_video_coordinates

st.set_page_config(page_title="Bug Fix Test", layout="wide")

st.title("🧪 Video Coordinates Bug Fix Test")

st.markdown("""
This is a focused test to verify the two bugs are fixed:

1. **Coordinates with custom width/height**: Coordinates should be in original video pixels
2. **Video reset on first click**: Video should preserve current time when clicked
""")

# Test with a data URL (base64 encoded minimal video) to avoid external dependencies
# This is a minimal valid MP4 file (1 frame, very small)
minimal_mp4_data_url = "data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAKptZGF0AAACoAYF//+c3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDEyNSAtIEguMjY0L01QRUctNCBBVkMgY29kZWMgLSBDb3B5bGVmdCAyMDAzLTIwMjEgLSBodHRwOi8vd3d3LnZpZGVvbGFuLm9yZy94MjY0Lmh0bWwgLSBvcHRpb25zOiBjYWJhYz0xIHJlZj0zIGRlYmxvY2s9MTowOjAgYW5hbHlzZT0weDM6MHgxMTMgbWU9aGV4IHN1Ym1lPTcgcHN5PTEgcHN5X3JkPTEuMDA6MC4wMCBtaXhlZF9yZWY9MSBtZV9yYW5nZT0xNiBjaHJvbWFfbWU9MSB0cmVsbGlzPTEgOHg4ZGN0PTEgY3FtPTAgZGVhZHpvbmU9MjEsMTEgZmFzdF9wc2tpcD0xIGNocm9tYV9xcF9vZmZzZXQ9LTIgdGhyZWFkcz0xMSBsb29rYWhlYWRfdGhyZWFkcz0xIHNsaWNlZF90aHJlYWRzPTAgbnI9MiBkZWNpbWF0ZT0xIGludGVybGFjZWQ9MCBibHVyYXlfY29tcGF0PTAgY29uc3RyYWluZWRfaW50cmE9MCBiZnJhbWVzPTMgYl9weXJhbWlkPTIgYl9hZGFwdD0xIGJfYmlhcz0wIGRpcmVjdD0xIHdlaWdodGI9MSBvcGVuX2dvcD0wIHdlaWdodHA9MiBrZXlpbnQ9MjUwIGtleWludF9taW49MjUgc2NlbmVjdXQ9NDAgaW50cmFfcmVmcmVzaD0wIHJjX2xvb2thaGVhZD00MCByYz1jcmYgbWJ0cmVlPTEgY3JmPTIzLjAgcWNvbXA9MC42MCBxcG1pbj0wIHFwbWF4PTY5IHFwc3RlcD00IGlwX3JhdGlvPTEuNDAgYXE9MToxLjAwAIAAAAA="

col1, col2 = st.columns([2, 1])

with col1:
    st.subheader("Test Video (400x300 scaled)")
    st.write("Video will be displayed at 400x300, but coordinates should be in original video pixels")
    
    # Use a small data URL to test without external dependencies
    clicks = streamlit_video_coordinates(
        minimal_mp4_data_url, 
        key="test_video", 
        width=400, 
        height=300
    )

with col2:
    st.subheader("Results")
    
    if clicks:
        st.write(f"**Total clicks: {len(clicks)}**")
        
        for i, click in enumerate(clicks):
            st.write(f"**Click {i+1}:**")
            st.write(f"- Coordinates: ({click['x']}, {click['y']})")
            st.write(f"- Frame time: {click['frame_time']:.3f}s")
            st.write(f"- Video size: {click.get('width', 'N/A')} × {click.get('height', 'N/A')}")
            
            # Analyze if coordinates are in correct range
            video_w = click.get('width', 400)
            video_h = click.get('height', 300)
            display_w, display_h = 400, 300
            
            if video_w != display_w or video_h != display_h:
                if 0 <= click['x'] <= video_w and 0 <= click['y'] <= video_h:
                    st.success("✅ Coordinates in video pixel space")
                else:
                    st.error("❌ Coordinates outside video range")
            
            st.write("---")
    else:
        st.info("Pause the video and click on it to test")

# Instructions
st.markdown("""
### Testing Instructions:

1. **Bug #1 Test (Coordinate Scaling):**
   - The video is scaled to 400x300 pixels for display
   - Click on different parts of the video
   - Coordinates should be in the original video dimensions, not 400x300

2. **Bug #2 Test (Video Reset):**
   - If the video loads and plays, pause it at a time > 0 seconds
   - Click on the video
   - Check if the video stays at the same time or resets to 0

### Expected Behavior:
- Coordinates should be scaled to original video dimensions
- Video should NOT reset to beginning on click
- Console logs should show coordinate scaling information
""")