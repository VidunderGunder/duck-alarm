import { Tensor } from "@tensorflow/tfjs";
import {birdLabels} from "../labels/birds";

export function processPredictions(predictions?: Tensor) {
  // Define predictionArray if predictions is defined and is a tensor of rank 2
  const predictionArray =
    predictions instanceof Tensor && predictions.rank === 2
      ? (predictions.arraySync() as number[][])[0]
      : undefined;

  const backgroundProbability = predictionArray
    ? (predictionArray[964] * 100).toFixed()
    : 0;
  const maxProbability = (
    Math.max(...(predictionArray ?? [0])) * 100
  ).toFixed();
  const minProbability = (
    Math.min(...(predictionArray ?? [0])) * 100
  ).toFixed();

  const maxIndex = predictionArray
    ? predictionArray.indexOf(Math.max(...predictionArray))
    : 0;

  const maxLabel = birdLabels[maxIndex];

  return {
    maxIndex,
    maxProbability,
    backgroundProbability,
    predictionArray,
    maxLabel
  };
}
