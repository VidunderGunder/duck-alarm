/** @jsxImportSource @emotion/react */

import { css } from "@emotion/react";
import { Box, Center, Code, Container, Text } from "@mantine/core";
import { useStoreState } from "pullstate";
import { ComponentPropsWithoutRef } from "react";
import { store } from "../Store";

export default function FeedDetections() {
  // props: ComponentPropsWithoutRef<typeof Box>
  const cam = useStoreState(store, (state) => state.cam);
  // const bounds = useStoreState(store, (state) => state.cameraBounds);
  const detected = useStoreState(store, (state) => state.detectedObjects);
  const detectedBirds = useStoreState(store, (state) => state.detectedBirds);

  console.log(cam);

  return (
    // Box
    //   css={css`
    //     position: absolute;
    //     top: 0;
    //     left: 0;
    //     width: 100%;
    //     height: 100%;
    //     z-index: 1;
    //   `}
    //   {...props}
    <>
      {detected.map((thing) => {
        if (thing.class === "bird") return null;

        const [x, y, width, height] = thing.bbox;
        const [xPercent, yPercent, widthPercent, heightPercent] = [
          100 * (x / cam.width),
          100 * (y / cam.height),
          100 * (width / cam.width),
          100 * (height / cam.height),
        ];
        const [top, left] = [yPercent, xPercent];

        const mirrored = !cam?.placeholder && cam?.facingMode === "user";

        return (
          <div
            key={[thing.class, ...thing.bbox].join("-")}
            css={css`
              position: absolute;
              top: ${top}%;
              left: ${mirrored ? 100 - left - widthPercent : left}%;
              width: ${widthPercent}%;
              height: ${heightPercent}%;
              border: 2px solid rgba(190, 7, 23, 0.5);
              padding: 0.5rem 1rem;
              border-radius: 1rem;
              background-color: rgba(190, 7, 23, 0.125);
              opacity: ${thing.score < 0.75 ? thing.score : 1};
            `}
          >
            <div
              css={css`
                filter: drop-shadow(0 0 0.1rem rgba(0, 0, 0, 0.5));
              `}
            >
              <b>{thing.class}</b>
            </div>
            <div>{(100 * thing.score).toFixed()}%</div>
          </div>
        );
      })}
      {detectedBirds.map((thing, i) => {
        const [x, y, width, height] = thing.bbox;
        const [xPercent, yPercent, widthPercent, heightPercent] = [
          100 * (x / cam.width),
          100 * (y / cam.height),
          100 * (width / cam.width),
          100 * (height / cam.height),
        ];
        const [top, left] = [yPercent, xPercent];

        const mirrored = cam?.facingMode === "user";

        return (
          <div
            key={[thing.class, ...thing.bbox].join("-")}
            css={css`
              position: absolute;
              top: ${top}%;
              left: ${mirrored ? 100 - left - widthPercent : left}%;
              width: ${widthPercent}%;
              height: ${heightPercent}%;
              border: 2px solid rgba(17, 145, 96, 0.5);
              padding: 0.5rem 1rem;
              border-radius: 1rem;
              background-color: rgba(17, 145, 96, 0.125);
              opacity: ${thing.score < 0.5 + 0.1 ? thing.score : 1};
            `}
          >
            <div
              css={css`
                filter: drop-shadow(0 0 0.1rem rgba(0, 0, 0, 0.5));
              `}
            >
              <b>{thing.class}</b> ({(100 * thing.score).toFixed()}
              %)
            </div>
            <div>
              {thing.species} ({(100 * thing.speciesProbability).toFixed()}%)
            </div>
          </div>
        );
      })}
    </>
  );
}
