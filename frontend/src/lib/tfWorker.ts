import * as tf from '@tensorflow/tfjs';

let model: tf.GraphModel | null = null;
let isMock = false;

self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;

  if (type === 'LOAD_MODEL') {
    try {
      await tf.ready();
      // Assuming models are available in the public directory relative to origin
      // The main thread should pass the absolute origin or we rely on relative paths if supported
      model = await tf.loadGraphModel(`${payload.origin}/models/${payload.modelName}/model.json`);
      self.postMessage({ type: 'MODEL_LOADED' });
    } catch (err) {
      console.warn("TF Worker: Model load failed, falling back to mock mode.", err);
      isMock = true;
      self.postMessage({ type: 'MODEL_LOAD_FAILED', error: String(err) });
    }
  }

  if (type === 'PREDICT') {
    if (!model && !isMock) {
        self.postMessage({ type: 'PREDICTION_ERROR', error: 'Model not loaded' });
        return;
    }

    if (isMock) {
      // Return dummy probabilities for mock mode
      self.postMessage({ type: 'PREDICTION_RESULT', result: new Float32Array([0.85, 0.10, 0.05]) });
      return;
    }

    try {
      const { imageData } = payload; // ImageData object passed from main thread
      
      const prediction = tf.tidy(() => {
        const imgTensor = tf.browser.fromPixels(imageData);
        
        const processedTensor = imgTensor
          .resizeBilinear([224, 224])
          .toFloat()
          .div(tf.scalar(255))
          .expandDims(0);

        return (model!.predict(processedTensor) as tf.Tensor).dataSync();
      });

      self.postMessage({ type: 'PREDICTION_RESULT', result: prediction });
    } catch (error) {
      self.postMessage({ type: 'PREDICTION_ERROR', error: String(error) });
    }
  }
};
