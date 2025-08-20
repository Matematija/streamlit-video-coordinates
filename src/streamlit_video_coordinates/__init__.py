from __future__ import annotations

import base64
import tempfile
from pathlib import Path
from typing import Callable, Any, List, Dict

import streamlit as st
import streamlit.components.v1 as components

# Tell streamlit that there is a component called streamlit_video_coordinates,
# and that the code to display that component is in the "frontend" folder
frontend_dir = (Path(__file__).parent / "frontend").absolute()
_component_func = components.declare_component(
    "streamlit_video_coordinates", path=str(frontend_dir)
)


def streamlit_video_coordinates(
    source: str | Path | bytes | Any,
    height: int | None = None,
    width: int | None = None,
    key: str | None = None,
    on_click: Callable[[], None] | None = None,
    start_time: float = 0.0,
) -> List[Dict[str, Any]]:
    """
    Display a video and capture coordinates when clicked on paused frames.
    
    Parameters
    ----------
    source : str | Path | bytes | Any
        The video source. Can be:
        - URL string (e.g., "https://example.com/video.mp4")
        - Local file path
        - Video file bytes (from file uploader)
        - File-like object with .read() method
    height : int | None
        The height of the video player. If None, uses default height
    width : int | None
        The width of the video player. If None, uses default width
    key : str | None
        Unique key for the component
    on_click : Callable[[], None] | None
        Callback function to call when video is clicked
    start_time : float
        Start time of the video in seconds
        
    Returns
    -------
    List[Dict[str, Any]]
        List of click events, each containing:
        - x: X coordinate of click
        - y: Y coordinate of click
        - frame_time: Current video time in seconds
        - frame_index: Estimated frame index
        - width: Video width at time of click
        - height: Video height at time of click
        - unix_time: Unix timestamp of click
    """
    
    # Handle different source types
    if isinstance(source, (str, Path)):
        if str(source).startswith(("http://", "https://")):
            # URL source
            video_src = str(source)
        else:
            # Local file path
            if isinstance(source, str):
                source = Path(source)
            if not source.exists():
                raise FileNotFoundError(f"Video file not found: {source}")
            
            # Read file and encode as base64 data URL
            content = source.read_bytes()
            encoded = base64.b64encode(content).decode("utf-8")
            
            # Determine MIME type based on file extension
            extension = source.suffix.lower()
            if extension in [".mp4"]:
                mime_type = "video/mp4"
            elif extension in [".webm"]:
                mime_type = "video/webm"
            elif extension in [".ogg", ".ogv"]:
                mime_type = "video/ogg"
            elif extension in [".avi"]:
                mime_type = "video/x-msvideo"
            elif extension in [".mov"]:
                mime_type = "video/quicktime"
            else:
                mime_type = "video/mp4"  # Default fallback
                
            video_src = f"data:{mime_type};base64,{encoded}"
    elif isinstance(source, bytes):
        # Raw bytes - assume MP4
        encoded = base64.b64encode(source).decode("utf-8")
        video_src = f"data:video/mp4;base64,{encoded}"
    elif hasattr(source, 'read'):
        # File-like object (e.g., from st.file_uploader)
        if hasattr(source, 'getvalue'):
            # BytesIO or similar
            content = source.getvalue()
        else:
            # Read from file-like object
            content = source.read()
            
        if hasattr(source, 'name'):
            # Try to determine type from filename
            name = getattr(source, 'name', '')
            if name.lower().endswith('.webm'):
                mime_type = "video/webm"
            elif name.lower().endswith('.ogg') or name.lower().endswith('.ogv'):
                mime_type = "video/ogg"
            elif name.lower().endswith('.avi'):
                mime_type = "video/x-msvideo"
            elif name.lower().endswith('.mov'):
                mime_type = "video/quicktime"
            else:
                mime_type = "video/mp4"
        else:
            mime_type = "video/mp4"
            
        encoded = base64.b64encode(content).decode("utf-8")
        video_src = f"data:{mime_type};base64,{encoded}"
    else:
        raise ValueError(
            "Source must be a URL string, file path, bytes, or file-like object"
        )

    # Call the frontend component
    result = _component_func(
        src=video_src,
        height=height,
        width=width,
        start_time=start_time,
        key=key,
        on_change=on_click,
    )
    
    # Return the clicks data (will be None initially, then a list of click events)
    return result if result is not None else []


def main():
    st.set_page_config(
        page_title="Streamlit Video Coordinates",
        page_icon="🎯",
        layout="wide",
    )
    
    st.title("🎯 Streamlit Video Coordinates")
    
    st.markdown("""
    This component allows you to display a video and capture coordinates when you click on paused frames.
    
    **Instructions:**
    1. Upload a video file or provide a URL
    2. Play the video and pause at the frame you want to annotate
    3. Click on the video to capture coordinates and frame information
    """)
    
    # Example with file upload
    st.header("Upload Video File")
    uploaded_file = st.file_uploader(
        "Choose a video file", 
        type=['mp4', 'webm', 'ogg', 'avi', 'mov']
    )
    
    if uploaded_file is not None:
        st.write("### Uploaded Video Example")
        clicks = streamlit_video_coordinates(
            uploaded_file,
            key="uploaded_video",
            width=640,
            height=360
        )
        
        if clicks:
            st.write("**Click Data:**")
            for i, click in enumerate(clicks):
                st.write(f"Click {i+1}: x={click['x']}, y={click['y']}, "
                        f"frame_time={click['frame_time']:.2f}s, "
                        f"frame_index={click.get('frame_index', 'N/A')}")
    
    # Example with URL
    st.header("Video URL")
    video_url = st.text_input(
        "Enter video URL", 
        placeholder="https://example.com/video.mp4"
    )
    
    if video_url:
        st.write("### URL Video Example")
        try:
            clicks = streamlit_video_coordinates(
                video_url,
                key="url_video",
                width=640,
                height=360
            )
            
            if clicks:
                st.write("**Click Data:**")
                for i, click in enumerate(clicks):
                    st.write(f"Click {i+1}: x={click['x']}, y={click['y']}, "
                            f"frame_time={click['frame_time']:.2f}s, "
                            f"frame_index={click.get('frame_index', 'N/A')}")
        except Exception as e:
            st.error(f"Error loading video: {e}")


if __name__ == "__main__":
    main()