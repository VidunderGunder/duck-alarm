/** @jsxImportSource @emotion/react */
import { Global, css } from "@emotion/react";
import {
  AppShell,
  Burger,
  Button,
  Center,
  Code,
  Container,
  Header,
  List,
  MantineProvider,
  MediaQuery,
  Navbar,
  ScrollArea,
  Text,
  Title,
} from "@mantine/core";
import Brand from "./components/Brand";
import { Camera } from "./components/Camera";
import { appCSS } from "./styles";
import { FaCamera } from "react-icons/fa";
import { ComponentPropsWithoutRef, useState } from "react";
import { useStoreState } from "pullstate";
import { store } from "./Store";
import { Tensor } from "@tensorflow/tfjs";
import Microphone from "./components/Microphone";
import { processPredictions } from "./functions/predict";

const navbarPixelHeight = 50;

export default function App() {
  const detected = useStoreState(store, (state) => state.detectedObjects);
  const cameraBounds = useStoreState(store, (state) => state.cameraBounds);
  const cameraConfig = useStoreState(store, (state) => state.cameraConfig);
  const detectedBirds = useStoreState(store, (state) => state.detectedBirds);
  const predictions = useStoreState(store, (state) => state.predictions);
  const [opened, setOpened] = useState(false);

  const { maxProbability, backgroundProbability, maxLabel } =
    processPredictions(predictions);

  return (
    <MantineProvider theme={{ colorScheme: "dark" }}>
      <Global styles={appCSS} />
      <AppShell
        padding={0}
        navbarOffsetBreakpoint="sm"
        header={
          <Header height={navbarPixelHeight} padding="sm">
            {/* Handle other responsive styles with MediaQuery component or createStyles function */}
            <div
              css={css`
                display: flex;
                align-items: center;
                height: 100%;
              `}
            >
              <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                <Burger
                  opened={opened}
                  onClick={() => setOpened((o) => !o)}
                  size="sm"
                  // color={theme.colors.gray[6]}
                  mr="xl"
                />
              </MediaQuery>
              <Brand />
            </div>
          </Header>
        }
        navbar={
          <Navbar
            width={{ base: 300 }}
            padding="sm"
            hiddenBreakpoint="sm"
            hidden={!opened}
          >
            <Navbar.Section grow>
              <div
                css={css`
                  display: flex;
                  flex-direction: column;
                  gap: 0.5rem;
                `}
              >
                <Button
                  fullWidth
                  variant="gradient"
                  gradient={{ from: "indigo", to: "cyan" }}
                  leftIcon={<FaCamera />}
                >
                  Camera
                </Button>
              </div>
            </Navbar.Section>
            {/* <Navbar.Section>
              <Divider />
              <Text>FOOTER</Text>
            </Navbar.Section> */}
          </Navbar>
        }
        styles={(theme) => ({
          main: {
            backgroundColor:
              theme.colorScheme === "dark"
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
          },
        })}
      >
        <ScrollArea
          css={css`
            height: calc(100vh - ${navbarPixelHeight}px);
          `}
        >
          <Container>
            <div
              css={css`
                display: grid;
                grid-template-areas:
                  "feed feed"
                  "video audio";
                place-items: start start;
                padding: 1rem;
                grid-gap: 1rem;
                overflow: scroll;
              `}
            >
              <Center
                css={css`
                  grid-area: feed;
                  place-self: center;
                  height: 100%;
                  padding: 0.5rem 0;
                  max-height: min(30vh, 300px);

                  // Make video less distracting when developing
                  /* opacity: 0.1; */
                `}
              >
                <div
                  css={css`
                    position: relative;
                    height: 100%;
                  `}
                >
                  <Camera
                    css={css`
                      height: 100%;
                    `}
                  />
                  {detected.map((thing, i) => {
                    if (thing.class === "bird") return null;

                    const [x, y, width, height] = thing.bbox;
                    const [xPercent, yPercent, widthPercent, heightPercent] = [
                      100 * (x / cameraConfig.width),
                      100 * (y / cameraConfig.height),
                      100 * (width / cameraConfig.width),
                      100 * (height / cameraConfig.height),
                    ];
                    const [top, left] = [yPercent, xPercent];

                    const mirrored = cameraConfig?.facingMode === "user";

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
                      100 * (x / cameraConfig.width),
                      100 * (y / cameraConfig.height),
                      100 * (width / cameraConfig.width),
                      100 * (height / cameraConfig.height),
                    ];
                    const [top, left] = [yPercent, xPercent];

                    const mirrored = cameraConfig?.facingMode === "user";

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
                          {thing.species} (
                          {(100 * thing.speciesProbability).toFixed()}%)
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Center>
              <div
                css={css`
                  grid-area: video;
                `}
              >
                <div
                  css={css`
                    opacity: 0.25;
                  `}
                >
                  <Title order={5}>📹 Bird Classifier (Whole Image)</Title>
                  <LeftPad>
                    <List>
                      <List.Item>
                        background ({backgroundProbability}%)
                      </List.Item>
                      <List.Item>
                        {/* @ts-ignore */}
                        max ({maxLabel} at {maxProbability}%)
                      </List.Item>
                    </List>
                  </LeftPad>
                </div>
                <Title
                  order={5}
                  css={css`
                    margin-top: 1rem;
                  `}
                >
                  📹 Detected Objects (Positioned)
                </Title>
                <LeftPad>
                  <List>
                    {detected.map((result, i) => (
                      <List.Item key={[result.class, i].join("-")}>
                        {result.class} ({(result.score * 100).toFixed(0)}%)
                      </List.Item>
                    ))}
                  </List>
                </LeftPad>
              </div>
              <div
                css={css`
                  grid-area: audio;
                `}
              >
                <Title order={5}>🎤 Audio Classifier</Title>
                <LeftPad>
                  <Microphone />
                </LeftPad>
                <Title
                  order={5}
                  css={css`
                    margin-top: 2.5rem;
                  `}
                >
                  📹 Detected Birds (Positioned)
                </Title>
                <LeftPad>
                  <List>
                    {detectedBirds.map((result, i) => (
                      <List.Item key={[result.class, i].join("-")}>
                        {result.species} (
                        {(result.speciesProbability * 100).toFixed()}%)
                      </List.Item>
                    ))}
                  </List>
                </LeftPad>
              </div>
            </div>
          </Container>
        </ScrollArea>
      </AppShell>
    </MantineProvider>
  );
}

function LeftPad({ children, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      css={css`
        padding-left: 0.375rem;
      `}
      {...props}
    >
      {children}
    </div>
  );
}
