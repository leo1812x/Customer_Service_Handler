import type { ConversationInstance } from "twilio/lib/rest/conversations/v1/conversation";
import { ParticipantInstance } from "twilio/lib/rest/conversations/v1/conversation/participant";
import type Twilio from "twilio/lib/rest/Twilio";

//*import twilo shit and generate client
const accountSid: string = process.env.accountSid!;
const authToken: string = process.env.authToken!;
const client:Twilio = require('twilio')(accountSid, authToken);

//* phone numbers
const twilo_number = "+18667515235";
const my_number = "+15046891609";

// #region messages
/**
 * sends a message from my twilio number to another number
 * @param msg 
 * @param recipient #number of recipient
 */
async function sendMsg(msg:string, recipient:string){
await client.messages
    .create({
        body: msg,
        messagingServiceSid: 'MGb638c190122837d6d80069fbb22cfd85',
        to: `${recipient}`
    })
    .then((message: { sid: any; }) => console.log(message.sid));
}
// sendMsg("test 2 xdd", my_number);

/**
 * this needs to be implemented correctly
 * @param Sid message's sid
 * @broken
 */
async function fetchMessage(Sid:string) {
    const message = await client
      .messages(Sid)
      .fetch();
  
    console.log(message.body);
}

/**
 * need to write something here
 * @param Sid message sid
 */
async function deleteMessage(Sid:string) {
    await client.messages(Sid).remove();
}

// #endregion




// #region conversation

/**
 * Creates a new conversation with the specified friendly name.
 * @param {string} conversation_name - The friendly name for the new conversation.
 * @returns {Promise<ConversationInstance>} A promise that resolves to the created conversation instance.
 */
async function createConversation(conversation_name: string):Promise<ConversationInstance> {
  const conversation = await client.conversations.v1.conversations.create({
    friendlyName: conversation_name,
  });

//   console.log("conversation created, conversation Sid:");
//   console.log(conversation.sid);
//   console.log("\n");
  
  return conversation;
}


/**
 * Fetches a conversation instance from Twilio using the provided conversation SID.
 * @param {string} conversation_sid - The SID of the conversation to fetch.
 * @returns {Promise<ConversationInstance>} A promise that resolves to the fetched conversation instance.
 */
async function fetchConversation(conversation_sid: string): Promise<ConversationInstance> {
    const conversation = await client.conversations.v1
        .conversations(conversation_sid)
        .fetch();
  
    // console.log("conversation fetches, chatservice Sid:");
    // console.log(conversation.chatServiceSid, "\n");

    // return conversation.chat_service_sid;
    return conversation;
    
}
/**
 * Creates an SMS participant in the specified conversation.
 * @param {string} conversation_sid - The SID of the conversation where the participant will be created.
 * @param {string} number - The phone number of the participant.
 * @param {string} twilio_number - The Twilio phone number to be used as the proxy address.
 * @returns {Promise<string>} A promise that resolves to the SID of the created participant.
 */
async function createConversationParticipant_SMS(conversation_sid: string, number:string, twilio_number:string):Promise<string> {
    const participant = await client.conversations.v1
    .conversations(conversation_sid)
    .participants.create({
      "messagingBinding.address": number,
      "messagingBinding.proxyAddress": twilio_number,
    });

    // console.log("SMS participant created, participant Sid:");
    // console.log(participant.sid, "\n");
    
    return participant.sid;
}

/**
 * Creates a CHAT participant in the specified conversation.
 * Note: The TwilioBot class implements this method and should be used instead.
 * @param {string} conversation_sid - The SID of the conversation where the participant will be created.
 * @param {string} identity - The identity of the participant.
 * @returns {Promise<string>} A promise that resolves to the SID of the created participant.
 */
async function createConversationParticipant_CHAT(conversation_sid:string, identity:string):Promise<string> {
    const participant = await client.conversations.v1
        .conversations(conversation_sid)
        .participants.create({ identity: identity });
  
    // console.log("chat participant created, participant Sid:");
    // console.log(participant.sid, "\n");

    return participant.sid;
}

/**
 * Fetches a participant from a conversation.
 * @param {string} conversation_sid - The SID of the conversation.
 * @param {string} identity - The identity of the participant.
 * @returns {Promise<ParticipantInstance>} A promise that resolves to the fetched participant instance.
 */
async function fetchConversationParticipant(conversation_sid: string, identity: string): Promise<ParticipantInstance> {
    const participant = await client.conversations.v1
        .conversations(conversation_sid)
        .participants(identity)
        .fetch();
  
        return participant;
}

/**
 * fetches the conversations from my account
 * @returns {Promise<ConversationInstance[]>}an array with the current conversations
 */
async function fetch_listConversations(): Promise<ConversationInstance[]> {
    let conversations:ConversationInstance[] = await client.conversations.v1.conversations.list();
        
    return conversations;
}

/**
 * deletes a conversation
 * @param {string} conversationSid the sid of the conversation 
 */
async function deleteConversation(conversationSid: string) {
    try {
        await client.conversations.v1.conversations(conversationSid).remove();
        console.log(`Conversation with SID ${conversationSid} has been deleted.`);
    } catch (error) {
        console.error('Error deleting conversation:', error);
    }
}

/**
 * Sends a message to a specified conversation.
 * @param {string} conversation_sid - The SID of the conversation where the message will be sent.
 * @param {string} author - The identity of the sender.
 * @param {string} body - The content of the message.
 * @returns {Promise<void>} A promise that resolves when the message is sent.
 */
async function sendMessage(conversation_sid:string, author:string, body:string):Promise<void> {
    const message = await client.conversations.v1
        .conversations(conversation_sid)
        .messages.create({
            author: author,  // The identity of the participant sending the message
            body: body,      // The message content
        });
}
/**
 * Removes a participant from a specified conversation.
 * @param {string} conversationSid - The SID of the conversation.
 * @param {string} participantSid - The SID of the participant to be removed.
 * @returns {Promise<void>} A promise that resolves when the participant is removed.
 */
async function deleteParticipant(conversationSid: string, participantSid: string): Promise<void> {
    try {
        await client.conversations.v1
            .conversations(conversationSid)
            .participants(participantSid)
            .remove();

        // console.log(`Participant with SID ${participantSid} has been removed from conversation ${conversationSid}.`);
    } catch (error) {
        console.error('Error removing participant:', error);
    }
}



// #region CLASSES


/**
 * Creates an instance of TwilioBot
 * @param {string} conversationSid - The unique identifier for the conversation.
 * @param {string} identity - The identity of the participant (e.g., bot or user).
 */
class TwilioBot{

    constructor( private conversationSid: string, private identity: string){}

    //* Async method to initialize the client by creating the participant

    
    /**
     * Initializes the conversation by retrieving the list of participants and checking if the current participant is already in the conversation.
     * If the participant is not found, it adds the participant to the conversation.
     *
     * @returns {Promise<void>} A promise that resolves when the initialization is complete.
     */
    async initialize() {
        
            //* get participants from the conversation
            const participants: ParticipantInstance[] = await client.conversations.v1.conversations(this.conversationSid).participants.list();

            ///* find if participant is already in conversation
            let found: boolean = participants.some((participant) => participant.identity === this.identity);        
    
            if (found) {
                console.log("Participant already exists");
            }
            else {
                await createConversationParticipant_CHAT(this.conversationSid, "bot");
        }
    }


    
    /**
     * Sends a message to the conversation where the bot lives.
     * @param body - The content of the message to be sent.
     * @throws {Error} If the client is not initialized.
     * @remarks
     * Ensure that the client is initialized by calling the `initialize()` method before invoking this method.
     */
    async sendMessage(body: string) {
        if (!this.conversationSid) {
            throw new Error("Client is not initialized. Call 'initialize()' first.");
        }

        await sendMessage(this.conversationSid, this.identity, body);
    }


    /**
     * Retrieves a participant instance from a conversation.
     *
     * @returns {Promise<ParticipantInstance>} A promise that resolves to the participant instance.
     */
    async get(): Promise<ParticipantInstance>{
        return await fetchConversationParticipant(this.conversationSid, this.identity);
    }
}











/**
 * creates a conversation
 * @param {string} name name for the conversation
 */
class Twilio_Conversation{
    constructor(private name: string){}

    /**
     * Initializes the Twilio handler by retrieving the list of conversations
     * and checking if a conversation with the specified unique name already exists.
     * @returns {Promise<void>} A promise that resolves when the initialization is complete.
     */
    async initialize(){
        //* get list of conversations
        const conversations: ConversationInstance[] = await client.conversations.v1.conversations.list();

        ///* find if conversation already exists
        let found: boolean = conversations.some((conversation) => conversation.uniqueName === this.name);        
  
        if (found) {
            console.log("Conversation already exists");
        }
        else {
            await createConversation(this.name);
            console.log(`coversation ${this.name} created`);
            
        }
    }

    /**
     * Retrieves a conversation instance based on the current object's name.
     * @returns {Promise<ConversationInstance>} A promise that resolves to a ConversationInstance.
     */
    async get(): Promise<ConversationInstance>{
        return fetchConversation(this.name)
    }
}


// #endregion conversations
// #region TESTING


async function create3WayConversation(conversation_name:string, number1: string, number2: string) {
    //* create the conversation
    let conversation = await new Twilio_Conversation("conversation_test");
    conversation.initialize();
    

    //*create and add bot to conversation
    let bot = await new TwilioBot((await conversation.get()).sid, "bot");
    bot.initialize();

    //*add my number to conversation
    let me = await createConversationParticipant_SMS((await conversation.get()).sid, number1, twilo_number);

    //*print info to use codesandox
    console.log((await conversation.get()).chatServiceSid);
    console.log("bot");
    
}

create3WayConversation("3way conversation test", my_number, my_number);
// #endregion 




























