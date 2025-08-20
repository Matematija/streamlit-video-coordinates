# Copyright (c) Streamlit Inc. (2018-2022) Snowflake Inc. (2022-2025)
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""URL utilities based on streamlit's url_util module."""

from __future__ import annotations

from typing import Final, Literal
from urllib.parse import urlparse

from typing_extensions import TypeAlias

UrlSchema: TypeAlias = Literal["http", "https", "mailto", "data"]


def is_url(
    url: str,
    allowed_schemas: tuple[UrlSchema, ...] = ("http", "https"),
) -> bool:
    """Check if a string looks like an URL.

    This doesn't check if the URL is actually valid or reachable.

    Parameters
    ----------
    url : str
        The URL to check.

    allowed_schemas : Tuple[str]
        The allowed URL schemas. Default is ("http", "https").
    """
    try:
        result = urlparse(str(url))
        if result.scheme not in allowed_schemas:
            return False

        if result.scheme in ["http", "https"]:
            return bool(result.netloc)
        if result.scheme in ["mailto", "data"]:
            return bool(result.path)

    except ValueError:
        return False
    return False