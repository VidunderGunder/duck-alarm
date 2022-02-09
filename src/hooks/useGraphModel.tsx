import { useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";

export default function useGraphModel(modelPath: string) {
  const [model, setModel] = useState<tf.GraphModel | null>(null);

  async function loadModel() {
    try {
      const _model = await tf.loadGraphModel(modelPath);
      setModel(_model);
      console.log("Layers model loaded");
    } catch (err) {
      console.log("Layers model failed to load:");
      console.log(err);
    }
  }

  useEffect(() => {
    tf.ready().then(() => {
      loadModel();
    });
  }, []);

  return { loading: model === null, model };
}
