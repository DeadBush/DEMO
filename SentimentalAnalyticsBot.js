const { ActivityHandler, MessageFactory } = require("botbuilder");
const { analyzeText } = require("./bot");

class SentimentalAnalyticsBot extends ActivityHandler{
    constructor() {
        super();
        this.onMessage(async(context, next)=>{
            let userText = context.activity.text;
            const starttime = new Date();
            let response = await analyzeText(userText);
            const endTime = new Date();
            console.log(endTime - starttime) / 1000;
            await context.sendActivity(response);
            await next();
        });

        this.onMembersAdded(async (context,next)=>{
            const membersAdded = context.activity.membersAdded;
            const welcomeText = "Hello this is Ky Anh's chatbot";
            for (let cnt = 0; cnt <membersAdded.length; ++cnt){
                if (membersAdded[cnt].id !== context.activity.recipient.id){
                    await context.sendActivity(MessageFactory.text(welcomeText,welcomeText));
                }
            }
            await next();
        });
    }
}

module.exports = SentimentalAnalyticsBot;