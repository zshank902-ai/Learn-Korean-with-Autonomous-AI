import tensorflow as tf
import os
from typing import Union

class ModelManager:
    """
    Principal Architect: High-performance model loader supporting 
    both Keras (.h5) and Optimized (.tflite) formats.
    """
    
    @staticmethod
    def load_model(model_path: str) -> Union[tf.keras.Model, tf.lite.Interpreter]:
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at: {model_path}")

        if model_path.endswith('.h5') or model_path.endswith('.keras'):
            return ModelManager._load_keras_model(model_path)
        elif model_path.endswith('.tflite'):
            return ModelManager._load_tflite_model(model_path)
        else:
            raise ValueError("Unsupported model format. Use .h5, .keras, or .tflite")

    @staticmethod
    def _load_keras_model(path: str):
        print(f"Loading full Keras model: {path}")
        return tf.keras.models.load_model(path)

    @staticmethod
    def _load_tflite_model(path: str):
        print(f"Loading quantized TFLite model: {path}")
        # Initialize TFLite interpreter
        interpreter = tf.lite.Interpreter(model_path=path)
        interpreter.allocate_tensors()
        return interpreter

    @staticmethod
    def run_tflite_inference(interpreter: tf.lite.Interpreter, input_data: tf.Tensor):
        """
        Helper for quantized inference.
        """
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()

        # Set input tensor
        interpreter.set_tensor(input_details[0]['index'], input_data)
        
        # Run inference
        interpreter.invoke()

        # Get output tensor
        return interpreter.get_tensor(output_details[0]['index'])

model_manager = ModelManager()
