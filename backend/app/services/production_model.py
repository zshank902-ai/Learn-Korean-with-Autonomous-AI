import tensorflow as tf
import numpy as np
import os
from app.services.model_manager import model_manager
from app.services.async_inference import run_async_inference

class ProductionModelServer:
    """
    Principal MLOps Logic: Handles efficient loading, warm-up, 
    and non-blocking querying of TensorFlow models.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ProductionModelServer, cls).__new__(cls)
            cls._instance.is_ready = False
        return cls._instance

    def initialize(self, model_path: str = None):
        """
        Singleton initialization with model warm-up.
        """
        print(f"MLOps: Initializing Production Model Server...")
        
        # Load from path or use default scaffolding
        if model_path and os.path.exists(model_path):
            self.model = model_manager.load_model(model_path)
        else:
            # Fallback to our optimized Hybrid CNN-LSTM if no weights provided
            from app.services.sequence_model import sequence_model_engine
            self.model = sequence_model_engine.get_model()

        # Warm-up sequence to prevent first-request latency
        self._warm_up()
        self.is_ready = True
        print("MLOps: Production Model Server is LIVE.")

    def _warm_up(self):
        """
        Triggers a dummy pass through the model to initialize JIT and weights.
        """
        # Assuming input shape (None, 50) based on our SequenceModel
        dummy_input = np.zeros((1, 50))
        self.model.predict(dummy_input, verbose=0)

    def predict_sync(self, tokenized_input: list):
        """
        Fast synchronous inference.
        """
        # Ensure input is a numpy array with batch dimension
        input_data = np.array([tokenized_input])
        prediction = self.model.predict(input_data, verbose=0)
        return prediction.tolist()

    async def predict_async(self, tokenized_input: list):
        """
        High-performance non-blocking inference for WebSockets.
        """
        return await run_async_inference(self.predict_sync, tokenized_input)

# Shared instance for the application
model_server = ProductionModelServer()
