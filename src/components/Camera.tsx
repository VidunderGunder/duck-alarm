/** @jsxImportSource @emotion/react */

import { css } from "@emotion/react";
import { Box } from "@mantine/core";
import { ComponentPropsWithoutRef } from "react";
import { Feed } from "./Feed";
import FeedDetections from "./FeedDetections";

export default function Camera(props: ComponentPropsWithoutRef<typeof Box>) {
  return (
    <Box {...props}>
      <Box
        css={css`
          position: relative;
          width: 100%;
          height: 100%;
        `}
      >
        <Feed />
        <FeedDetections />
      </Box>
    </Box>
  );
}
