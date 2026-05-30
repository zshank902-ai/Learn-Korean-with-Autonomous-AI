import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import Callable, Any

# Principal Architect: Global executor for CPU-bound TensorFlow tasks
# This prevents blocking the FastAPI event loop during heavy inference.
inference_executor = ThreadPoolExecutor(max_workers=4)


async def run_async_inference(func: Callable, *args) -> Any:
    """
    Helper to run a synchronous inference function in a separate thread.
    Uses get_running_loop() instead of deprecated get_event_loop().
    """
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(inference_executor, func, *args)
