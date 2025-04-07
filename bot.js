const { ActivityHandler, MessageFactory } = require('botbuilder');
const { AzureKeyCredential, TextAnalyticsClient } = require("@azure/ai-text-analytics");

const restify = require('restify');
const server = restify.createServer();

// Optional: set up middleware, etc.
server.use(restify.plugins.bodyParser());

// Now you can use server.post(...)
// DirectLine Token
server.post('/directline/token', async (req, res) => {

    const id = (req.body && req.body.id)? `dl_${req.body.id}`: `dl_default_user`

    const options = {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer 4nCOXzAzRZsYjGpRTSN5QjVS5AAIhoPqCVzN93mrxR9cj0rA4d6fJQQJ99BDACqBBLyXJ3w3AAAaACOGQVKT`,
            'Content-Type': 'application/json',
         },
        url: 'https://directline.botframework.com/v3/directline/tokens/generate', 
        data: {
            user: { id }
        }
    };

    try {
        const { data } = await axios(options);
        res.send(data);
    } catch ({ message }) {
        res.status(403);
        res.send({ message });
    }
});


class EchoBot extends ActivityHandler {
    constructor() {
        super();
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            const replyText = `Echo: ${ context.activity.text }`;
            await context.sendActivity(MessageFactory.text(replyText, replyText));
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = 'Hello and welcome!';
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
    
}

async function analyzeText(userText) {
    const endpoint = "https://sentimentalanalyticsbot.cognitiveservices.azure.com/";
    const key = "4nCOXzAzRZsYjGpRTSN5QjVS5AAIhoPqCVzN93mrxR9cj0rA4d6fJQQJ99BDACqBBLyXJ3w3AAAaACOGQVKT";
    const documents=[{
        text:userText,
        id:"0",
        language:"en",
    }];
    const client = new TextAnalyticsClient(endpoint, new AzureKeyCredential(key));
    const results = await client.analyzeSentiment(documents,{includeOpinionMining: true});
    let overallResponse = "";
    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if(!result.error) {
            let response = `Analysis for document: ${documents[i].text}\n`;
            response += `Overall Sentiment: ${result.sentiment}\n`;
            result.sentences.forEach(sentence => {
                response += ` Sentence: "${sentence.text}"\n`;
                response += ` - Sentiment: ${sentence.sentiment}\n`;
                response += ` - Confidence scores: ${JSON.stringify(sentence.confidenceScores)
                    .replace('{','').replace('}','')}`;
                response += ` - Details:\n`;
                sentence.opinions.forEach(opinion => {
                    opinion.assessments.forEach(assessment =>{
                        response += ` Phrase: "${assessment.text}" shows ${assessment.sentiment} sentiment;\n`;
                    });
                });
            });
            overallResponse += response;
        } else {
            console.error(`\tError: ${result.error}`);
        }

    } 
    console.log(overallResponse);
    return overallResponse;
}

module.exports.EchoBot = EchoBot;
module.exports.analyzeText = analyzeText;