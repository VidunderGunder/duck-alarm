/** @jsxImportSource @emotion/react */
import useGraphModel from "../hooks/useGraphModel";
import { data, Rank, Tensor } from "@tensorflow/tfjs";
import { useEffect, useState } from "react";
import { Button, List, Text } from "@mantine/core";
import { log } from "@tensorflow/tfjs-core/dist/log";
import { useStoreState } from "pullstate";
import { store } from "../Store";
import { audioLabels } from "../labels/audio";
import { css } from "@emotion/react";

/**
 * Classifies audio using [yamnet](https://tfhub.dev/google/tfjs-model/yamnet/tfjs/1)
 *
 * Relevant bird classes:
 *
 * ```json
 * {
 *   ...
 *   "93": "Fowl",
 *   "94": "Chicken, rooster",
 *   "95": "Cluck",
 *   "96": "Crowing, cock-a-doodle-doo",
 *   "97": "Turkey",
 *   "98": "Gobble",
 *   "99": "Duck",
 *   "100": "Quack",
 *   "101": "Goose",
 *   "102": "Honk",
 *   ...
 *   "106": "Bird",
 *   "107": "Bird vocalization, bird call, bird song",
 *   "108": "Chirp, tweet",
 *   "109": "Squawk",
 *   "110": "Pigeon, dove",
 *   "111": "Coo",
 *   "112": "Crow",
 *   "113": "Caw",
 *   "114": "Owl",
 *   "115": "Hoot",
 *   "116": "Bird flight, flapping wings",
 *   ...
 * }
 * ```
 */
export default function Microphone() {
  const { model, loading } = useGraphModel("/models/sounds/model.json");
  const detected = useStoreState(store, (state) => state.detectedAudio);
  const [recording, setRecording] = useState(false);
  const [mic, setMic] = useState<Awaited<ReturnType<typeof data.microphone>>>();

  /**
   * Get the waveform of the microphone input using tensorflow
   */
  async function handleAudio() {
    setRecording(true);

    if (!mic) {
      const mic = await data.microphone({
        // fftSize: 1024,
        // columnTruncateLength: 32,
        // numFramesPerSpectrogram: 10,
        // sampleRateHz: 48000,
        includeSpectrogram: false,
        includeWaveform: true,
        audioTrackConstraints: {
          echoCancellation: false,
          noiseSuppression: false,
        },
      });

      const sampleRate = mic.getSampleRate();

      if (sampleRate !== 48000) {
        throw new Error("Sample rate must be 48000");
      }

      setMic(mic);
    }

    if (!mic) {
      setRecording(false);
      return;
    }

    // Record 3 seconds of audio
    const audio = await mic.capture();

    if (!audio) {
      setRecording(false);
      return;
    }

    const flatAudio = audio.waveform.flatten();

    // Set the waveform in the store
    store.update((s) => {
      s.waveform = flatAudio;
    });

    const results = model?.predict(flatAudio) ?? [];

    const predictable = Array.isArray(results);

    if (predictable) {
      const [scores] = results;
      const top = scores.mean(0).argMax().asScalar().arraySync();
      const label = audioLabels[top];

      store.update((s) => {
        s.detectedAudio = label;
      });
    }

    setRecording(false);
  }

  // Loop handleAudio every second
  useEffect(() => {
    if (!recording) {
      const interval = setInterval(handleAudio, 250);
      return () => {
        clearInterval(interval);
      };
    }

    return function cleanup() {};
  }, [!recording]);

  // Stop mic on unmount
  useEffect(() => {
    return () => {
      mic?.stop();
    };
  }, [mic]);

  return (
    <>
      <Text>
        {detected}{" "}
        <i
          css={css`
            opacity: 0.5;
          `}
        >
          (Most likely)
        </i>
      </Text>
    </>
  );
}
