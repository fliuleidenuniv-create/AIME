# Text-to-Speech Chrome Extension with Summary Feature

## What is This?

This Chrome Extension enables users to select text on any webpage and have it read aloud using Google's Text-to-Speech API. Additionally, it offers a feature to summarize the selected text via OpenAI's GPT API, providing users with concise summaries of lengthy articles or paragraphs. I have used ChatGPT to help me create this project and README. 

## Prerequisites

Before you can run or test this extension locally, you will need the following:

- **Google Chrome Browser**: The latest version is recommended.
- **Google Cloud Account**: For accessing the Text-to-Speech API.
- **OpenAI Account**: For accessing the API used to generate text summaries.
- **API Keys**: A Google Cloud Text-to-Speech API key and an OpenAI API key are required for the extension's text-to-speech and summarization features to work.

## Setup

### Obtaining API Keys

1. **Google Text-to-Speech API Key**:
   - Visit the [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project or select an existing one.
   - Navigate to "APIs & Services" > "Credentials".
   - Click on "Create Credentials" and select "API key". Note down your API key.

2. **OpenAI API Key**:
   - Go to [OpenAI](https://openai.com/) and sign in or create an account.
   - Access the API section and generate a new API key. Note down your API key.

### Configuring the Extension

1. Clone or download the extension repository to your local machine.

2. Open the `manifest.json` file and locate the `permissions` section. Ensure that `"activeTab"` and `"storage"` are included in the list of permissions.

3. Find the configuration file (usually named `config.js` or similar) within the extension's directory. Enter your Google Text-to-Speech and OpenAI API keys in the designated spots:

   ```javascript
   const config = {
     GOOGLE_API_KEY: 'YOUR_GOOGLE_TEXT_TO_SPEECH_API_KEY_HERE',
     OPENAI_API_KEY: 'YOUR_OPENAI_API_KEY_HERE'
   };```
   
### Loading the Extension in Chrome

1. Open Google Chrome and navigate to chrome://extensions/.
2. Enable "Developer mode" at the top right.
3. Click on "Load unpacked" and select the extension's directory from your local machine.
4. The extension should now appear in your list of extensions. Pin it to the toolbar for easy access.

### Running/Testing the Extension

1. Click on the extension icon in the Chrome toolbar and select "Read Aloud" or "Summarize" after highlighting text on any webpage.
2. The extension will use the Google Text-to-Speech API to read the text aloud or the OpenAI API to generate and display a summary.

Notes

- The Google Text-to-Speech API may incur costs based on usage. Review the pricing details before extensive use.
- Similarly, OpenAI's API usage is subject to their pricing and usage limits.

Enjoy using the extension, and feel free to contribute or report any issues!
