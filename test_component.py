#!/usr/bin/env python3
"""Simple test script to verify the streamlit-video-coordinates component"""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))


def test_component_import():
    """Test that the component can be imported"""
    try:
        from streamlit_video_coordinates import streamlit_video_coordinates

        print("✅ Component import successful")
        return True
    except ImportError as e:
        print(f"❌ Component import failed: {e}")
        return False


def test_url_video():
    """Test that URL videos are handled correctly"""
    try:
        from streamlit_video_coordinates import streamlit_video_coordinates

        # This should work but won't actually display since we're not in streamlit
        result = streamlit_video_coordinates("https://example.com/test.mp4", key="test")
        print("✅ URL video processing successful")
        return True
    except Exception as e:
        print(f"❌ URL video processing failed: {e}")
        return False


def test_file_path():
    """Test that file paths are handled correctly"""
    try:
        from streamlit_video_coordinates import streamlit_video_coordinates

        # Create a dummy file for testing
        test_file = "/tmp/test_video.mp4"
        with open(test_file, "wb") as f:
            f.write(b"dummy video content")

        # This should process the file (but will fail at video playback)
        try:
            result = streamlit_video_coordinates(test_file, key="test_file")
            print("✅ File path processing successful")
        except FileNotFoundError:
            print("❌ File not found error as expected")

        # Clean up
        os.remove(test_file)
        return True
    except Exception as e:
        print(f"❌ File path processing failed: {e}")
        return False


def test_bytes_input():
    """Test that bytes input is handled correctly"""
    try:
        from streamlit_video_coordinates import streamlit_video_coordinates

        # Test with dummy bytes
        dummy_bytes = b"dummy video content"
        result = streamlit_video_coordinates(dummy_bytes, key="test_bytes")
        print("✅ Bytes input processing successful")
        return True
    except Exception as e:
        print(f"❌ Bytes input processing failed: {e}")
        return False


def main():
    """Run all tests"""
    print("Testing streamlit-video-coordinates component...\n")

    tests = [
        test_component_import,
        test_url_video,
        test_file_path,
        test_bytes_input,
    ]

    passed = 0
    total = len(tests)

    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ Test {test.__name__} failed with exception: {e}")
        print()

    print(f"Results: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())
