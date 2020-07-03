const fs = require("fs").promises;
const wav = require("node-wav");
const { OpusEncoder } = require("@discordjs/opus");

module.exports = async function encode(file) {
  const buffer = await fs.readFile(file);
  const result = wav.decode(buffer);
  const encoder = new OpusEncoder(result.sampleRate, result.numberOfChannels);
  console.log("Detected sample:", result.sampleRate);

  try {
    const encoded = encoder.encode(result.channelData);
    console.log("ENCODED?", encoded);
  } catch (e) {
    console.log("ERR", e);
  }
};
