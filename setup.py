from setuptools import setup, find_packages

setup(
    name="streamlit-video-coordinates",
    version="0.1.0",
    description="Streamlit component that displays a video and returns coordinates when you click on paused frames",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    install_requires=[
        "streamlit>=1.34",
    ],
    package_data={
        "streamlit_video_coordinates": ["frontend/*"],
    },
    include_package_data=True,
    python_requires=">=3.8",
)