/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { ComponentPropsWithoutRef, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import useMeasure from "react-use-measure";
import { store } from "../Store";
import { useStoreState } from "pullstate";
import useModel from "../hooks/useModel";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import useGraphModel from "../hooks/useGraphModel";
import {
  browser,
  NamedTensorMap,
  Rank,
  scalar,
  Tensor,
  Tensor3D,
} from "@tensorflow/tfjs";
import { birdLabels } from "../labels/birds";

export function Camera(props: ComponentPropsWithoutRef<"div">) {
  const { model: detect, loading: loadingDetect } =
    useModel<cocoSsd.ObjectDetection>(cocoSsd, "Detect");
  const { model: classify, loading: loadingClassify } = useGraphModel(
    "/models/birds-image/model.json"
  );

  const [active, setActive] = useState(false);

  const [webcamContainerRef, bounds] = useMeasure();
  const webcamRef = useRef<Webcam>(null);

  const frequency = useStoreState(store, (state) => state.frequency);
  const cameraConfig = useStoreState(store, (state) => state.cameraConfig);
  const mirrored = cameraConfig?.facingMode === "user";

  const video = webcamRef?.current?.video;

  function predict(
    image: Tensor3D
  ): Tensor<Rank> | Tensor<Rank>[] | NamedTensorMap | undefined {
    const imageResized = image.resizeNearestNeighbor([224, 224]).toFloat();
    const imageNormalized = scalar(1.0).sub(imageResized.div(scalar(255.0)));
    const imageBatched = imageNormalized.expandDims(0);
    return classify?.predict(imageBatched);
  }

  // Update camera bounds to store on window resize
  useEffect(() => {
    if (bounds) {
      store.update((s) => {
        s.cameraBounds = bounds;
      });
    }
  }, [bounds]);

  useEffect(() => {
    const interval = setInterval(
      async () => {
        if (!video) return;

        let detected: cocoSsd.DetectedObject[] | undefined;
        let predicted:
          | Tensor<Rank>
          | Tensor<Rank>[]
          | NamedTensorMap
          | undefined;

        let image: ReturnType<typeof browser.fromPixels>;

        try {
          detected = await detect?.detect(video, 20, 0.25);

          image = browser.fromPixels(video);
          predicted = predict(image);
        } catch {
          return;
        }

        // ------------
        if (detected !== undefined) {
          const detectedBirds = detected
            .filter((thing) => {
              return thing.class === "bird";
            })
            .map((bird) => {
              const { bbox } = bird;
              let [x, y, width, height] = bbox;

              // convert to ints
              [x, y, width, height] = [
                Math.floor(x),
                Math.floor(y),
                Math.floor(width),
                Math.floor(height),
              ];

              // Ensure the bounding box is within the image
              [x, y, width, height] = [
                Math.max(x, 0),
                Math.max(y, 0),
                Math.min(width, image.shape[0] - x),
                Math.min(height, image.shape[1] - y),
              ];

              const birdImage = image.slice([y, x], [height, width]);

              const birdSpecies = predict(birdImage);

              let label: string | undefined;

              if (birdSpecies instanceof Tensor && birdSpecies.rank === 2) {
                const index = birdSpecies.argMax(1).arraySync();
                if (Array.isArray(index)) {
                  if (typeof index === "number") {
                    label = birdLabels[index];
                  }
                }
              }

              return {
                ...bird,
                species: label ?? "unknown",
              };
            });
          store.update((s) => {
            s.detectedBirds = detectedBirds;
          });
        }

        // Classify birds by species using bounding boxes from detections
        // ------------
        store.update((s) => {
          if (detected !== undefined) {
            s.detectedObjects = detected;
          }
          if (predicted !== undefined && predicted instanceof Tensor) {
            s.predictions = predicted;
          }
        });
      },
      frequency !== undefined ? 1000 / frequency : undefined
    );
    return () => {
      clearInterval(interval);
    };
  }, [active]);

  return (
    <div
      css={css`
        position: relative;
        width: 100%;
      `}
      {...props}
    >
      <div ref={webcamContainerRef}>
        <Webcam
          mirrored={mirrored}
          audio={false}
          id="video"
          ref={webcamRef}
          onUserMedia={async () => {
            if (!active) setActive(true);
          }}
          width={"100%"}
          height={"100%"}
          videoConstraints={cameraConfig}
          css={css`
            border-radius: 0.5em;
            box-shadow: 0 3px 0 0 rgba(20, 20, 20, 1),
              0 4px 14px -5px rgba(0, 0, 0, 0.5);
          `}
        />
      </div>
    </div>
  );
}
