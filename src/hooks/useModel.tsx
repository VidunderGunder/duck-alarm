import { useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";

type TFModel<T> = {
  load: () => Promise<T>;
};

export default function useModel<T>(tfModel: TFModel<T>) {
  const [model, setModel] = useState<T | null>(null);

  async function loadModel() {
    try {
      const _model = await tfModel.load();
      setModel(_model);
      console.log("Model loaded");
    } catch (err) {
      console.log(err);
      console.log("Model failed to load");
    }
  }

  useEffect(() => {
    tf.ready().then(() => {
      loadModel();
    });
  }, []);

  return { loading: model === null, model };
}
