/** @jsxImportSource @emotion/react */
import { Global, css } from "@emotion/react";
import {
  AppShell,
  Burger,
  Button,
  Code,
  Header,
  List,
  MantineProvider,
  MediaQuery,
  Navbar,
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
import labels from "./labels/birds.json";
import Microphone from "./components/Microphone";

export default function App() {
  const detected = useStoreState(store, (state) => state.detectedObjects);
  const predictions = useStoreState(store, (state) => state.predictions);
  const [opened, setOpened] = useState(false);

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

  return (
    <MantineProvider theme={{ colorScheme: "dark" }}>
      <Global styles={appCSS} />
      <AppShell
        fixed
        padding={0}
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
        navbarOffsetBreakpoint="sm"
        header={
          <Header height={70} padding="md">
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
      >
        <div
          css={css`
            display: grid;
            grid-template-areas:
              "feed feed"
              "video audio";
            place-items: start center;
            padding: 1rem;
            grid-gap: 1rem;
          `}
        >
          <div
            css={css`
              grid-area: feed;
              // Make video less distracting when developing
              opacity: 0.1;
            `}
          >
            <Camera />
          </div>
          <div
            css={css`
              grid-area: video;
            `}
          >
            <Title order={3}>📹 Bird Classifier</Title>
            <LeftPad>
              <List>
                <List.Item>background ({backgroundProbability}%)</List.Item>
                <List.Item>
                  {/* @ts-ignore */}
                  max ({labels[maxIndex]} at {maxProbability}%)
                </List.Item>
              </List>
            </LeftPad>
            <Title
              order={3}
              css={css`
                margin-top: 1rem;
              `}
            >
              📹 Detected Objects
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
            <Title order={3}>🎤 Audio Classifier</Title>
            <LeftPad>
              <Microphone />
            </LeftPad>
          </div>
        </div>
      </AppShell>
    </MantineProvider>
  );
}

function LeftPad({ children, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      css={css`
        padding-left: 3rem;
      `}
      {...props}
    >
      {children}
    </div>
  );
}
