import streamlit as st
from streamlit_video_coordinates import streamlit_video_coordinates

"""
# Simple Video Coordinates Example

This is a minimal example showing how to use the streamlit-video-coordinates component.
"""

# File upload example
uploaded_file = st.file_uploader("Upload a video", type=["mp4", "webm", "ogg"])

if uploaded_file:
    st.write("### Video with Coordinate Capture")

    # Use the component
    clicks = streamlit_video_coordinates(uploaded_file, key="simple_video", width=500, height=300)

    # Display results
    if clicks:
        st.write(f"**{len(clicks)} clicks recorded:**")
        for i, click in enumerate(clicks):
            st.write(f"{i+1}. ({click['x']}, {click['y']}) at {click['frame_time']:.2f}s")
    else:
        st.info("Pause the video and click to capture coordinates!")

# URL example
st.write("### Or try with a URL:")
url = st.text_input("Video URL")

if url:
    clicks_url = streamlit_video_coordinates(url, key="url_video", width=500, height=300)

    if clicks_url:
        st.write(f"**{len(clicks_url)} clicks recorded:**")
        for i, click in enumerate(clicks_url):
            st.write(f"{i+1}. ({click['x']}, {click['y']}) at {click['frame_time']:.2f}s")
