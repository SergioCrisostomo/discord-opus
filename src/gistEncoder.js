const fs = require("fs").promises;
const path = require("path");
const { OpusEncoder } = require("@discordjs/opus");
const WaveFile = require("wavefile").WaveFile;

async function encodePCM(file) {
  const wav_file = await fs.readFile(file);
  const wav = new WaveFile(wav_file);

  // Check some of the file properties
  console.log("Sample rate:::\t\t", wav.fmt.sampleRate);
  console.log("Nr channels:::\t\t", wav.fmt.numChannels);

  const encoder = new OpusEncoder(wav.fmt.sampleRate, wav.fmt.numChannels);
  // encoder.setBitrate(48000); // make sure it sounds like ****

  const samples = wav.getSamples(true, Int16Array);
  console.log("Samples:::\t\t", samples.length);

  const ptime = 20; // ms
  const samples_per_frame =
    (wav.fmt.sampleRate / (1000 / ptime)) * wav.fmt.numChannels;

  console.log("Samples per frame:::\t", samples_per_frame);

  const output_data = new Uint8Array(samples.length * 2);
  for (let i = 0; i < samples.length - 1; i += samples_per_frame) {
    const lastIndex = Math.min(samples.length, i + samples_per_frame);
    if (lastIndex === samples.length) break;

    const encoded = encoder.encode(samples.slice(i, lastIndex));
    output_data.set(encoder.decode(encoded), i * 2);
  }

  const output_wav = new WaveFile();
  output_wav.fromScratch(
    wav.fmt.numChannels,
    wav.fmt.sampleRate,
    "16",
    new Int16Array(output_data.buffer)
  );

  fs.writeFile(
    path.join(__dirname, "../test/assets/out.wav"),
    output_wav.toBuffer()
  );
}

const testFile = path.join(__dirname, "../test/assets/input_48000.wav");
const opusData = encodePCM(testFile);

module.exports = encodePCM;
