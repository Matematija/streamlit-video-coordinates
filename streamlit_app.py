import streamlit as st
from src.streamlit_video_coordinates import streamlit_video_coordinates

st.set_page_config(
    page_title="Streamlit Video Coordinates Demo",
    page_icon="🎯",
    layout="wide",
)

st.title("🎯 Streamlit Video Coordinates Demo")

st.markdown(
    """
This component allows you to display a video and capture coordinates when you click on paused frames.

**Instructions:**
1. Upload a video file or provide a URL
2. Play the video and pause at the frame you want to annotate
3. Click on the paused video to capture coordinates and frame information
4. The video will show click markers and display coordinate data below

**Features:**
- Supports multiple video formats (MP4, WebM, OGG, AVI, MOV)
- Captures pixel coordinates relative to video display
- Records frame time and estimated frame index
- Visual click markers with frame information
- Persistent click data across interactions
"""
)

# Create tabs for different input methods
tab1, tab2 = st.tabs(["📁 File Upload", "🔗 URL Input"])

with tab1:
    st.header("Upload Video File")
    uploaded_file = st.file_uploader(
        "Choose a video file",
        type=["mp4", "webm", "ogg", "avi", "mov"],
        help="Upload a video file to annotate with coordinate clicks",
    )

    if uploaded_file is not None:
        st.success(f"Uploaded: {uploaded_file.name}")

        col1, col2 = st.columns([2, 1])

        with col1:
            st.subheader("Video Player")
            clicks = streamlit_video_coordinates(
                uploaded_file, key="uploaded_video", width=640, height=360
            )

        with col2:
            st.subheader("Click Data")
            if clicks:
                st.write(f"**Total clicks: {len(clicks)}**")

                # Display clicks in a nice format
                for i, click in enumerate(clicks):
                    with st.expander(f"Click {i+1} - Frame {click['frame_time']:.2f}s"):
                        st.write(f"**Coordinates:** ({click['x']}, {click['y']})")
                        st.write(f"**Frame Time:** {click['frame_time']:.3f} seconds")
                        st.write(f"**Frame Index:** {click.get('frame_index', 'N/A')}")
                        st.write(
                            f"**Video Size:** {click.get('width', 'N/A')} × {click.get('height', 'N/A')}"
                        )
                        st.write(f"**Timestamp:** {click.get('unix_time', 'N/A')}")

                # Export data
                if st.button("📋 Copy Coordinates as JSON", key="copy_upload"):
                    import json

                    json_data = json.dumps(clicks, indent=2)
                    st.text_area("JSON Data:", json_data, height=200)
            else:
                st.info("Pause the video and click on it to capture coordinates")

with tab2:
    st.header("Video URL")

    # Provide some example URLs
    st.write("**Example URLs (you can try these):**")
    example_urls = [
        "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4",
    ]

    for url in example_urls:
        if st.button(f"Use: {url}", key=f"url_{hash(url)}"):
            st.session_state["video_url"] = url

    video_url = st.text_input(
        "Enter video URL",
        value=st.session_state.get("video_url", ""),
        placeholder="https://example.com/video.mp4",
        help="Enter a direct URL to a video file",
    )

    if video_url:
        try:
            col1, col2 = st.columns([2, 1])

            with col1:
                st.subheader("Video Player")
                clicks = streamlit_video_coordinates(
                    video_url, key="url_video", width=640, height=360
                )

            with col2:
                st.subheader("Click Data")
                if clicks:
                    st.write(f"**Total clicks: {len(clicks)}**")

                    # Display clicks in a nice format
                    for i, click in enumerate(clicks):
                        with st.expander(f"Click {i+1} - Frame {click['frame_time']:.2f}s"):
                            st.write(f"**Coordinates:** ({click['x']}, {click['y']})")
                            st.write(f"**Frame Time:** {click['frame_time']:.3f} seconds")
                            st.write(f"**Frame Index:** {click.get('frame_index', 'N/A')}")
                            st.write(
                                f"**Video Size:** {click.get('width', 'N/A')} × {click.get('height', 'N/A')}"
                            )
                            st.write(f"**Timestamp:** {click.get('unix_time', 'N/A')}")

                    # Export data
                    if st.button("📋 Copy Coordinates as JSON", key="copy_url"):
                        import json

                        json_data = json.dumps(clicks, indent=2)
                        st.text_area("JSON Data:", json_data, height=200)
                else:
                    st.info("Pause the video and click on it to capture coordinates")

        except Exception as e:
            st.error(f"Error loading video: {e}")
            st.write("Please make sure the URL is a direct link to a video file and is accessible.")

# Add some usage tips
st.header("💡 Usage Tips")

tips_col1, tips_col2 = st.columns(2)

with tips_col1:
    st.markdown(
        """
    **Best Practices:**
    - Use videos in common formats (MP4, WebM)
    - Pause the video before clicking to capture coordinates
    - Click markers show on the video for reference
    - Coordinate data persists across page interactions
    """
    )

with tips_col2:
    st.markdown(
        """
    **Use Cases:**
    - Video annotation and labeling
    - Object tracking setup
    - Scene analysis and measurement
    - Creating training data for computer vision
    """
    )

# Footer
st.markdown("---")
st.markdown(
    "Built with Streamlit • [Source Code](https://github.com/Matematija/streamlit-video-coordinates)"
)
