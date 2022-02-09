import { Store } from "pullstate";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";

export type DetectedObject = cocoSsd.DetectedObject;

export const store = new Store<{
  detectedObjects: DetectedObject[];
  detectedDucks: DetectedObject[];
  predictions?: tf.Tensor<tf.Rank>;
  // | tf.Tensor<tf.Rank>[] | tf.NamedTensorMap;
  threshold: number;
  frequency?: number;
}>({
  detectedObjects: [],
  detectedDucks: [],
  threshold: 0.25,
  frequency: 1,
});
