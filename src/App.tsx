/** @jsxImportSource @emotion/react */
import { Global, css } from "@emotion/react";
import {
  AppShell,
  Box,
  Burger,
  Button,
  Header,
  List,
  MantineProvider,
  MediaQuery,
  Navbar,
  ScrollArea,
  Title,
} from "@mantine/core";
import Brand from "./components/Brand";
import { appCSS } from "./styles";
import { FaCamera } from "react-icons/fa";
import { ComponentPropsWithoutRef, useState } from "react";
import { useStoreState } from "pullstate";
import { store } from "./Store";
import Microphone from "./components/Microphone";
import { processPredictions } from "./functions/predict";
import Camera from "./components/Camera";
import FeedToggle from "./components/FeedToggle";

const navbarPixelHeight = 50;

export default function App() {
  const detected = useStoreState(store, (state) => state.detectedObjects);
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
      >
        <ScrollArea
          css={css`
            height: calc(100vh - ${navbarPixelHeight}px);
          `}
        >
          <Camera />
          <FeedToggle />

          <div>
            <div
              css={css`
                opacity: 0.25;
              `}
            >
              <Title order={5}>📹 Bird Classifier (Whole Image)</Title>
              <LeftPad>
                <List>
                  <List.Item>background ({backgroundProbability}%)</List.Item>
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
          <div>
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
