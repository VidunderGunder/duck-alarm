import { useEffect, useState } from "react";
import { ready } from "@tensorflow/tfjs";

type TFModel<T> = {
  load: () => Promise<T>;
};

export default function useModel<T>(tfModel: TFModel<T>, name = "Model") {
  const [model, setModel] = useState<T | null>(null);

  async function loadModel() {
    try {
      const _model = await tfModel.load();
      setModel(_model);
      console.log(name + " loaded");
    } catch (err) {
      console.log(err);
      console.log(name + " failed to load");
    }
  }

  useEffect(() => {
    ready().then(() => {
      console.log("Tensorflow ready");

      loadModel();
    });
  }, []);

  return { loading: model === null, model };
}
