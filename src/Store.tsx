import { Store } from "pullstate";
import { DetectedObject } from "@tensorflow-models/coco-ssd";
import { Tensor, tensor, Rank } from "@tensorflow/tfjs";

export const store = new Store<{
  detectedObjects: DetectedObject[];
  detectedBirds: ({ species: string } & DetectedObject)[];
  predictions?: Tensor<Rank>;
  waveform: Tensor<Rank>;
  detectedAudio: string;
  threshold: number;
  frequency?: number;
  cameraConfig?: {
    width: number;
    height: number;
    facingMode: "user" | "environment";
  };
}>({
  detectedObjects: [],
  detectedBirds: [],
  waveform: tensor([16000 * 3]),
  detectedAudio: "",
  threshold: 0.25,
  frequency: 1,
  cameraConfig: {
    width: 1280,
    height: 720,
    facingMode: "user",
  },
});
