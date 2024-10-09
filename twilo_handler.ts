import { sleep } from "bun";

//import twilo shit and generate client
const accountSid: string = process.env.accountSid!;
const authToken: string = process.env.authToken!;
const client = require('twilio')(accountSid, authToken);

//* numbers
const twilo_number: string = "+18777804236";
const my_number = "+15046891609"

// #region messages
//* only messages one person
async function sendMsg(msg:string, recipient:string){
await client.messages
    .create({
        body: msg,
        messagingServiceSid: 'MGb638c190122837d6d80069fbb22cfd85',
        to: `${recipient}`
    })
    .then((message: { sid: any; }) => console.log(message.sid));
}
// sendMsg("testing2", number);

//* fetch a message using it's id
async function fetchMessage(Sid:string) {
    const message = await client
      .messages(Sid)
      .fetch();
  
    console.log(message.body);
}

//* delete a message (not sure how it works)
async function deleteMessage(Sid:string) {
    await client.messages(Sid).remove();
}

// #endregion
// #region conversations

//* conversations
async function createConversation():Promise<string> {
  const conversation = await client.conversations.v1.conversations.create({
    friendlyName: "My First Conversation",
  });

  console.log("conversation created, conversation Sid:");
  console.log(conversation.sid);
  console.log("\n");
  
  return conversation.sid;
}

async function fetchConversation(conversation_sid: string): Promise<string> {
    const conversation = await client.conversations.v1
        .conversations(conversation_sid)
        .fetch();
  
    console.log("conversation fetches, chatservice Sid:");
    console.log(conversation.chatServiceSid);
    console.log("\n");

    return conversation.chat_service_sid
    
}

async function createConversationParticipant(conversation_sid: string, number1:string, number2:string):Promise<string> {
    const participant = await client.conversations.v1
        .conversations(conversation_sid)
        .participants.create({
        "messagingBinding.address": number1,
        "messagingBinding.proxyAddress": number2,
        });
  
    console.log(participant.sid);
    return participant.sid;
}

const conversation_sid = await createConversation(); //CHXXXXXXXXXXXX
const chat_service_sid = await fetchConversation(conversation_sid); //ISXXXXXXXXXXXX
const participant_sid = await createConversationParticipant(conversation_sid, my_number, twilo_number);



















// #endregion conversations










