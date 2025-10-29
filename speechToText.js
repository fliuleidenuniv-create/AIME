// speechToText.js

// Import the required Google Cloud libraries
const speech = require('@google-cloud/speech');

// Creates a client
const client = new speech.SpeechClient();

// Function to transcribe audio
async function transcribeAudio(audioFilePath) {
  // Reads a local audio file from disk to transcribe
  const fs = require('fs');
  const audioBytes = fs.readFileSync(audioFilePath).toString('base64');

  const audio = {
    content: audioBytes,
  };

  const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'en-US',
  };

  const request = {
    audio: audio,
    config: config,
  };

  // Detects speech in the audio file
  const [response] = await client.recognize(request);
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  console.log(`Transcription: ${transcription}`);
}

module.exports = {
  transcribeAudio,
};
