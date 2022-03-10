import { Store } from "pullstate";
import { DetectedObject } from "@tensorflow-models/coco-ssd";
import { Tensor, tensor, Rank } from "@tensorflow/tfjs";
import { RectReadOnly } from "react-use-measure";

export const store = new Store<{
  detectedObjects: DetectedObject[];
  detectedBirds: ({
    species: string;
    speciesProbability: number;
  } & DetectedObject)[];
  predictions?: Tensor<Rank>;
  waveform: Tensor<Rank>;
  detectedAudio: string;
  threshold: number;
  frequency?: number;
  cam: {
    width: number;
    height: number;
    facingMode: "user" | "environment";
    placeholder: boolean;
    ready: boolean;
  };
  cameraBounds: RectReadOnly;
}>({
  detectedObjects: [],
  detectedBirds: [],
  waveform: tensor([16000 * 3]),
  detectedAudio: "",
  threshold: 0.25,
  frequency: 10,
  cam: {
    width: 1280,
    height: 720,
    facingMode: "user",
    placeholder: true,
    ready: false,
  },
  cameraBounds: {
    left: 0,
    top: 0,
    width: 1280,
    height: 720,
    bottom: 720,
    right: 1280,
    x: 0,
    y: 0,
  },
});
