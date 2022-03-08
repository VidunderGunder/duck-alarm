/** @jsxImportSource @emotion/react */

import { css } from "@emotion/react";
import { Box, Switch, Text } from "@mantine/core";
import { useStoreState } from "pullstate";
import { ComponentPropsWithoutRef } from "react";
import { FcPicture, FcCamera } from "react-icons/fc";
import { store } from "../Store";

export default function FeedToggle(
  props: ComponentPropsWithoutRef<typeof Box>
) {
  const cameraConfig = useStoreState(store, (state) => state.cameraConfig);

  return (
    <Box {...props}>
      <Box
        css={css`
          display: grid;
          flex-direction: row;
          align-items: center;
          grid-gap: 0.25em;
          grid-template-columns: 1fr auto 1fr;
        `}
      >
        <Box
          css={css`
            display: flex;
            align-items: center;
            justify-content: end;
            gap: 0.25em;
          `}
        >
          <Text size="xl" weight={600}>
            VIDEO
          </Text>
          <FcPicture size={32} />
        </Box>
        <Switch
          size="xl"
          checked={!cameraConfig.placeholder}
          onChange={(e) => {
            store.update((s) => {
              s.cameraConfig.placeholder = !e.currentTarget.checked;
            });
          }}
        />
        <Box
          css={css`
            display: flex;
            align-items: center;
            gap: 0.25em;
          `}
        >
          <FcCamera size={32} />
          <Text size="xl" weight={600}>
            CAMERA
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
