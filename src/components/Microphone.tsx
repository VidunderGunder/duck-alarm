import useGraphModel from "../hooks/useGraphModel";
import * as tf from "@tensorflow/tfjs";
import { useEffect, useState } from "react";
import { Button, List } from "@mantine/core";
import { log } from "@tensorflow/tfjs-core/dist/log";
import { useStoreState } from "pullstate";
import { store } from "../Store";
import labels from "../labels/audio.json";

/**
 * 111,/m/015p6,"Bird"
 * 112,/m/020bb7,"Bird vocalization, bird call, bird song"
 * 113,/m/07pggtn,"Chirp, tweet"
 * 114,/m/07sx8x_,"Squawk"
 * 115,/m/0h0rv,"Pigeon, dove"
 * 116,/m/07r_25d,"Coo"
 * 117,/m/04s8yn,"Crow"
 * 118,/m/07r5c2p,"Caw"
 * 119,/m/09d5_,"Owl"
 * 120,/m/07r_80w,"Hoot"
 * 121,/m/05_wcq,"Bird flight, flapping wings"
 */
export default function Microphone() {
  const { model, loading } = useGraphModel("/models/sounds/model.json");
  const detected = useStoreState(store, (state) => state.detectedAudio);
  const [recording, setRecording] = useState(false);

  /**
   * Get the waveform of the microphone input using tensorflow
   */
  async function handleAudio() {
    setRecording(true);

    const mic = await tf.data.microphone({
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

    // Record 3 seconds of audio
    const audio = await mic.capture();

    mic.stop();
    setRecording(false);

    const flatAudio = audio.waveform.flatten();

    // Set the waveform in the store
    store.update((s) => {
      s.waveform = flatAudio;
    });

    // @ts-ignore
    const [scores] = model?.predict(flatAudio) ?? [];

    console.log(scores);

    // Get the top 5 predictions
    const topPredictions: { label: string; score: number }[] = scores
      // @ts-ignore
      .sort((a, b) => b.value - a.value)
      // @ts-ignore
      .map((p) => {
        // @ts-ignore
        const label = labels.find((l) => l.id === p.indices[0]);
        return {
          label: label?.name ?? "Unknown",
          score: p.value,
        };
      })
      .slice(0, 5);

    const result = scores?.mean(0).argMax().arraySync();
    store.update((s) => {
      // s.detectedAudio = [
      //   {
      //     // @ts-ignore
      //     label: labels[result] as string,
      //     score: scores.mean(0).arraySync()[result],
      //   },
      // ];
      s.detectedAudio = topPredictions;
    });
  }

  // Loop handleAudio every second
  useEffect(() => {
    if (!recording) {
      const interval = setInterval(handleAudio, 1000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [!recording]);

  return (
    <>
      {/* <Button fullWidth disabled={loading || recording} onClick={handleAudio}>
        {recording ? "Recording..." : "Record"}
      </Button> */}
      <List>
        {detected.map((e, i) => (
          <List.Item key={[e.label, i].join("-")}>
            {e.label}: {(e.score * 100).toFixed()}%
          </List.Item>
        ))}
      </List>
    </>
  );
}
