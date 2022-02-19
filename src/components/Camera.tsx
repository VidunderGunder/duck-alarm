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
} from "@tensorflow/tfjs";

export const Camera = (props: ComponentPropsWithoutRef<"div">) => {
  const { model: detect, loading: loadingDetect } =
    useModel<cocoSsd.ObjectDetection>(cocoSsd);
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

        try {
          detected = await detect?.detect(video, 20, 0.25);

          console.log(detected);

          const image = browser.fromPixels(video);
          const imageResized = image
            .resizeNearestNeighbor([224, 224])
            .toFloat();
          const imageNormalized = scalar(1.0).sub(
            imageResized.div(scalar(255.0))
          );
          const imageBatched = imageNormalized.expandDims(0);
          predicted = classify?.predict(imageBatched);
        } catch {
          return;
        }

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

  console.log({
    active,
    loadingClassify,
    loadingDetect,
  });

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
};
