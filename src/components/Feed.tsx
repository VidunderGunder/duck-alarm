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
  dispose,
  disposeVariables,
  NamedTensorMap,
  Rank,
  scalar,
  Tensor,
  Tensor3D,
  tidy,
} from "@tensorflow/tfjs";
import { birdLabels } from "../labels/birds";
import ReactPlayer from "react-player";
import { Box } from "@mantine/core";

export function Feed(props: ComponentPropsWithoutRef<"div">) {
  const { model: detect, loading: loadingDetect } =
    useModel<cocoSsd.ObjectDetection>(cocoSsd, "Detect");
  const { model: classify, loading: loadingClassify } = useGraphModel(
    "/models/birds-image/model.json"
  );

  const [active, setActive] = useState(false);

  const [webcamContainerRef, bounds] = useMeasure();
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<ReactPlayer>(null);

  const frequency = useStoreState(store, (state) => state.frequency);
  const cameraConfig = useStoreState(store, (state) => state.cameraConfig);
  const mirrored = cameraConfig?.facingMode === "user";

  const video = webcamRef?.current?.video;
  const canvas = canvasRef?.current;
  const player = playerRef?.current?.getInternalPlayer();

  console.log(video);
  console.log(canvas);
  console.log(player);

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

  // Update camera config on component load
  useEffect(() => {
    if (cameraConfig.placeholder) {
      store.update((s) => {
        s.cameraConfig = {
          width: canvas?.width ?? 1280,
          height: canvas?.height ?? 720,
          facingMode: "user",
          placeholder: s.cameraConfig?.placeholder ?? true,
        };
      });
    } else {
      store.update((s) => {
        s.cameraConfig = {
          width: video?.videoWidth ?? 1280,
          height: video?.videoHeight ?? 720,
          facingMode: "user",
          placeholder: s.cameraConfig?.placeholder ?? true,
        };
      });
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(
      async () => {
        if (!canvas || !video) return;

        let detected: cocoSsd.DetectedObject[] | undefined;
        let predicted:
          | Tensor<Rank>
          | Tensor<Rank>[]
          | NamedTensorMap
          | undefined;

        let image: ReturnType<typeof browser.fromPixels>;

        try {
          detected = await detect?.detect(
            cameraConfig.placeholder ? canvas : video,
            20,
            0.25
          );
          image = tidy(() =>
            browser.fromPixels(cameraConfig.placeholder ? canvas : video)
          );
          predicted = tidy(() => predict(image));
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

              // Pad the bounding box
              const paddingPercentage = 0.25;

              x -= Math.floor(width * paddingPercentage);
              y -= Math.floor(height * paddingPercentage);
              width += Math.floor(2 * (width * paddingPercentage));
              height += Math.floor(2 * (height * paddingPercentage));

              // Ensure the bounding box is within the image
              [x, y] = [Math.max(x, 0), Math.max(y, 0)];
              [width, height] = [
                Math.min(width, cameraConfig.width - x),
                Math.min(height, cameraConfig.height - y),
              ];

              bird.bbox = [x, y, width, height];

              const birdImage = image.slice([y, x], [height, width]);
              const birdSpecies = tidy(() => predict(birdImage));
              dispose(birdImage);

              let label: string | undefined;
              let probability: number | undefined;

              if (birdSpecies instanceof Tensor && birdSpecies.rank === 2) {
                // Get element at index 1 from tensor
                const species = tidy(() => birdSpecies.as1D());

                // Get the index of the highest probability
                const index = tidy(() => species.argMax().arraySync());
                probability = tidy(
                  () => species.gather([index]).arraySync()[0]
                );

                if (typeof index === "number") {
                  label = birdLabels[index];
                  if (label === "background") {
                    const indexSecond = tidy(() =>
                      species
                        .slice([1], [species.shape[0] - 1])
                        .argMax()
                        .arraySync()
                    );
                    if (typeof indexSecond === "number") {
                      probability = tidy(
                        () => species.gather([indexSecond]).arraySync()[0]
                      );
                      label = birdLabels[indexSecond];
                    }
                  }
                }
              }

              return {
                ...bird,
                species: label ?? "unknown",
                speciesProbability: probability ?? 0,
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

        dispose(image);
        disposeVariables();
      },
      frequency !== undefined ? 1000 / frequency : undefined
    );
    return () => {
      clearInterval(interval);
    };
  }, [active]);

  return (
    <div
      {...props}
      ref={webcamContainerRef}
      css={css`
        position: relative;
        border-radius: 0.5em;
        box-shadow: 0 3px 0 0 rgba(20, 20, 20, 1),
          0 4px 14px -5px rgba(0, 0, 0, 0.5);
        overflow: hidden;
      `}
    >
      {cameraConfig.placeholder ? (
        <>
          <Box
            css={css`
              position: relative;
              padding-top: 56.25%;

              .react-player {
                position: absolute;
                top: 0;
                left: 0;
              }
            `}
          >
            <ReactPlayer
              ref={playerRef}
              className="react-player"
              url={[
                "https://www.youtube.com/watch?v=f7wY4Cnuk-s",
                "https://www.youtube.com/watch?v=GM-PbqdWr68",
                "https://www.youtube.com/watch?v=099UcfY-rQI",
                "https://www.youtube.com/watch?v=JnKrN2NkY_M",
                "https://www.youtube.com/watch?v=zIRVadlcRoM",
              ]}
              width="100%"
              height="100%"
              controls
              playing
              loop
            />
          </Box>
        </>
      ) : (
        <Webcam
          mirrored={mirrored}
          audio={false}
          id="video"
          ref={webcamRef}
          onUserMedia={async () => {
            if (!active) setActive(true);
          }}
          width="100%"
          height="100%"
          videoConstraints={cameraConfig}
        />
      )}
    </div>
  );
}
