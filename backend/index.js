const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

class LangflowClient {
    constructor(baseURL, applicationToken) {
        this.baseURL = baseURL;
        this.applicationToken = applicationToken;
    }

    async post(endpoint, body, headers = { "Content-Type": "application/json" }) {
        headers["Authorization"] = `Bearer ${this.applicationToken}`;
        headers["Content-Type"] = "application/json";
        const url = `${this.baseURL}${endpoint}`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });

            const responseMessage = await response.json();
            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText} - ${JSON.stringify(responseMessage)}`);
            }
            return responseMessage;
        } catch (error) {
            console.error('Request Error:', error.message);
            throw error;
        }
    }

    async initiateSession(flowId, langflowId, inputValue, inputType = 'chat', outputType = 'chat', stream = false, tweaks = {}) {
        const endpoint = `/lf/${langflowId}/api/v1/run/${flowId}?stream=${stream}`;
        return this.post(endpoint, { input_value: inputValue, input_type: inputType, output_type: outputType, tweaks: tweaks });
    }

    handleStream(streamUrl, onUpdate, onClose, onError) {
        const eventSource = new EventSource(streamUrl);

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            onUpdate(data);
        };

        eventSource.onerror = (event) => {
            console.error('Stream Error:', event);
            onError(event);
            eventSource.close();
        };

        eventSource.addEventListener('close', () => {
            onClose('Stream closed');
            eventSource.close();
        });

        return eventSource;
    }

    async runFlow(flowIdOrName, langflowId, inputValue, inputType = 'chat', outputType = 'chat', tweaks = {}, stream = false, onUpdate, onClose, onError) {
        try {
            const initResponse = await this.initiateSession(flowIdOrName, langflowId, inputValue, inputType, outputType, stream, tweaks);
            console.log('Init Response:', initResponse);

            if (stream && initResponse && initResponse.outputs && initResponse.outputs[0].outputs[0].artifacts.stream_url) {
                const streamUrl = initResponse.outputs[0].outputs[0].artifacts.stream_url;
                console.log(`Streaming from: ${streamUrl}`);
                this.handleStream(streamUrl, onUpdate, onClose, onError);
            }

            return initResponse;
        } catch (error) {
            console.error('Error running flow:', error);
            onError('Error initiating session');
        }
    }
}

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const flowId = '6bf3708f-005e-4f5f-8df3-feed32451b14';
const langflowId = '8c40f040-3cc8-4198-8b78-eaf06abf62db';
const applicationToken = 'AstraCS:EpIQYNtmtXuBRiMyZoTywFvJ:ec88b17330086e3ffee6f4adfae4b595650b892d610db9edf7fe2700c5aa6f89'; // Replace with actual token
const langflowClient = new LangflowClient('https://api.langflow.astra.datastax.com', applicationToken);

app.post('/run-flow', async (req, res) => {
    const { inputValue, inputType = 'chat', outputType = 'chat', stream = false } = req.body;
    const tweaks = {
        "ChatInput-ak1ID": {},
        "ParseData-rkrt9": {},
        "Prompt-I7VVj": {},
        "ChatOutput-Sq2OG": {},
        "AstraDB-bSWeq": {},
        "GroqModel-4QBfY": {}
    };

    try {
        const response = await langflowClient.runFlow(
            flowId,
            langflowId,
            inputValue,
            inputType,
            outputType,
            tweaks,
            stream,
            (data) => console.log('Received:', data.chunk), 
            (message) => console.log('Stream Closed:', message),
            (error) => console.error('Stream Error:', error)
        );

        if (!stream && response && response.outputs) {
            const flowOutputs = response.outputs[0];
            const firstComponentOutputs = flowOutputs.outputs[0];
            const output = firstComponentOutputs.outputs.message;

            res.status(200).json({ success: true, message: output.message.text });
        } else {
            res.status(200).json({ success: true, response });
        }
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

async function main(inputValue, inputType = 'chat', outputType = 'chat', stream = false) {
    try {
        const tweaks = {
            "ChatInput-ak1ID": {},
            "ParseData-rkrt9": {},
            "Prompt-I7VVj": {},
            "ChatOutput-Sq2OG": {},
            "AstraDB-bSWeq": {},
            "GroqModel-4QBfY": {}
        };

        const response = await langflowClient.runFlow(
            flowId,
            langflowId,
            inputValue,
            inputType,
            outputType,
            tweaks,
            stream,
            (data) => console.log('Received:', data.chunk), 
            (message) => console.log('Stream Closed:', message), 
            (error) => console.error('Stream Error:', error) 
        );

        if (!stream && response && response.outputs) {
            const flowOutputs = response.outputs[0];
            const firstComponentOutputs = flowOutputs.outputs[0];
            const output = firstComponentOutputs.outputs.message;

            console.log('Final Output:', output.message.text);
        }
    } catch (error) {
        console.error('Main Error:', error.message);
    }
}

const args = process.argv.slice(2);
if (args.length < 1) {
    console.error('error');
}
main(
    args[0], 
    args[1], 
    args[2], 
    args[3] === 'true' 
);
