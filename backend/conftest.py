# conftest.py - shared pytest configuration
import pytest

# Ensure the cache is cleared between test sessions
@pytest.fixture(autouse=True, scope="session")
def reset_singletons():
    """Reset module-level singletons before the test session."""
    from api import cache, recommender, model_loader
    cache._cache = None
    recommender._recommender = None
    model_loader._bundle = None
    yield
    # cleanup
    cache._cache = None
    recommender._recommender = None
    model_loader._bundle = None
