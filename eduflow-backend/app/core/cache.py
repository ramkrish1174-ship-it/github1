from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from redis import asyncio as aioredis

async def init_cache():
    redis = aioredis.from_url(
        "redis://localhost"
    )

    FastAPICache.init(
        RedisBackend(redis),
        prefix="eduflow-cache"
    )