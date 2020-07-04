const fs = require("fs").promises;
const path = require("path");
const nodeWav = require("node-wav");
const { OpusEncoder } = require("@discordjs/opus");

function getPCMIndex(myWAVbytes) {
  // https://stackoverflow.com/a/49790562/2427193
  let posVal = 0;
  while (posVal < myWAVbytes.length) {
    const byteVal = myWAVbytes[posVal]; //read value at this offset

    if (byteVal == 0x64) {
      //# check for beginning "64" byte
      if (
        myWAVbytes[posVal] == 0x64 &&
        myWAVbytes[posVal + 1] == 0x61 &&
        myWAVbytes[posVal + 2] == 0x74 &&
        myWAVbytes[posVal + 3] == 0x61
      ) {
        //# found "data" sequence bytes
        return posVal + 8; // data 4 bytes + 4 bites for subchunk size area
      }
    }

    posVal++; //# move forward through bytes
  }
}

function* streamBuffer(buffer) {
  const chunkSize = 40;
  const chunk = buffer.slice(0, chunkSize);
  buffer = buffer.slice(chunkSize + 1);
  if (buffer.length < chunkSize) return chunk;
  else yield chunk;
}

async function encodePCM(file) {
  const buffer = await fs.readFile(file);
  const wav = nodeWav.decode(buffer);
  const encoder = new OpusEncoder(wav.sampleRate, wav.numberOfChannels);

  const pcmIndex = getPCMIndex(buffer);

  console.log("Detected sample:", wav.sampleRate);
  console.log("PCM index", pcmIndex);
  console.log("Buffer sample", buffer.slice(pcmIndex - 8, pcmIndex + 10));

  const stream = streamBuffer(buffer.slice(pcmIndex));
  let chunk = null;
  let encoded = [];

  do {
    chunk = stream.next();
    console.log("parsing...", chunk);
    encoded.push(encoder.encode(chunk));
  } while (!chunk.done);

  console.log(encoded);
  return encoded;
}

const testFile = path.join(__dirname, "../test/assets/input.wav");
const opusData = encodePCM(testFile);

module.exports = encodePCM;
