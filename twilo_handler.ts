//*import twilo shit and generate client
const accountSid: string = process.env.accountSid!;
const authToken: string = process.env.authToken!;
const client = require('twilio')(accountSid, authToken);

//* phone numbers
const twilo_number: string = "+18777804236";
const my_number = "+15046891609"

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
    console.log(conversation.chatServiceSid);
    console.log("\n");

    return conversation.chat_service_sid
    
}
//? create participant not working rn
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
// #endregion conversations
// #region TESTING

//* exaple create new conversation with it's chat service
// const conversation_sid = await createConversation(); //CHXXXXXXXXXXXX
// const chat_service_sid = await fetchConversation(conversation_sid); //ISXXXXXXXXXXXX

//*current for testing
const conversation_sid = "CH3360df1f462e49afa24e3a4ee53ab0ce";
const chat_service_sid = "ISfb0af8a6115e4bfdab6da3d037c29f21"; 

//? not working right now, need to get a working number
const participant_sid = await createConversationParticipant(conversation_sid, my_number, twilo_number);























// #endregion 




























