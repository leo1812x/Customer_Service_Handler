//*import twilo shit and generate client
const accountSid: string = process.env.accountSid!;
const authToken: string = process.env.authToken!;
const client = require('twilio')(accountSid, authToken);

//* phone numbers
const twilo_number = "+18777804236";
const my_number = "+15046891609";

// #region messages
//* messages one person
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

//* create a conversation, returns its Sid
async function createConversation():Promise<string> {
  const conversation = await client.conversations.v1.conversations.create({
    friendlyName: "My First Conversation",
  });

  console.log("conversation created, conversation Sid:");
  console.log(conversation.sid);
  console.log("\n");
  
  return conversation.sid;
}

//* fetch the conversations's chat service, returns its Sid
async function fetchConversation(conversation_sid: string): Promise<string> {
    const conversation = await client.conversations.v1
        .conversations(conversation_sid)
        .fetch();
  
    console.log("conversation fetches, chatservice Sid:");
    console.log(conversation.chatServiceSid, "\n");

    return conversation.chat_service_sid
    
}
//? create SMS participant not working rn, need working number
async function createConversationParticipant_SMS(conversation_sid: string, my_number:string, twilio_number:string):Promise<string> {
    const participant = await client.conversations.v1
    .conversations(conversation_sid)
    .participants.create({
      "messagingBinding.address": my_number,
      "messagingBinding.proxyAddress": twilio_number,
    });

    console.log("SMS participant created, participant Sid:");
    console.log(participant.sid, "\n");
    
    return participant.sid;
}

//*create CHAT participant, uses commant at the bottom to create identity
//twilio token:chat --identity {identity name here} --chat-service-sid ISXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX --profile leo

async function createConversationParticipant_CHAT(conversation_sid:string, identity:string) {
    const participant = await client.conversations.v1
        .conversations(conversation_sid)
        .participants.create({ identity: identity });
  
    console.log("chat participant created, participant Sid:");
    console.log(participant.sid, "\n");
}

// #endregion conversations
// #region TESTING

//* exaple create new conversation with it's chat service
// const conversation_sid = await createConversation(); //CHXXXXXXXXXXXX
// const chat_service_sid = await fetchConversation(conversation_sid); //ISXXXXXXXXXXXX

//*current for testing
const conversation_sid = "CH3360df1f462e49afa24e3a4ee53ab0ce";
const chat_service_sid = "ISfb0af8a6115e4bfdab6da3d037c29f21"; 

//? not working right now, need to get a working number
const participant_sid = await createConversationParticipant_SMS(conversation_sid, my_number, twilo_number);

//*chat participant using the sandbox/nodebox
// const participant_sid = createConversationParticipant_CHAT(conversation_sid, "admin");



// #endregion 




























