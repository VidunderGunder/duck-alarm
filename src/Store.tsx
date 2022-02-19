import { Store } from "pullstate";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";

export type DetectedObject = cocoSsd.DetectedObject;

export const store = new Store<{
  detectedObjects: DetectedObject[];
  detectedDucks: DetectedObject[];
  predictions?: tf.Tensor<tf.Rank>;
  // | tf.Tensor<tf.Rank>[] | tf.NamedTensorMap;
  waveform: tf.Tensor<tf.Rank>;
  detectedAudio: { label: string; score: number }[];
  threshold: number;
  frequency?: number;
}>({
  detectedObjects: [],
  detectedDucks: [],
  waveform: tf.tensor([16000 * 3]),
  detectedAudio: [],
  threshold: 0.25,
  frequency: 1,
});
