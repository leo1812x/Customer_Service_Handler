import { sleep } from "bun";
import type { webhook } from "twilio";
import AccessToken, { ChatGrant } from "twilio/lib/jwt/AccessToken";
import type { ConversationInstance } from "twilio/lib/rest/conversations/v1/conversation";
import { ParticipantInstance } from "twilio/lib/rest/conversations/v1/conversation/participant";
import type { WebhookInstance } from "twilio/lib/rest/numbers/v1/webhook";
import type Twilio from "twilio/lib/rest/Twilio";

//*import twilo shit and generate client
const ACCOUNT_SID = process.env.ACCOUNT_SID!;
const AUTH_TOKEN = process.env.AUTH_TOKEN!;
const API_KEY = process.env.API_KEY!;
const API_KEY_SECRET = process.env.API_KEY_SECRET!;
const CLIENT:Twilio = require('twilio')(ACCOUNT_SID, AUTH_TOKEN);

//* phone numbers
const TWILIO_NUMBER = "+18667515235";
const MY_NUMBER = "+15046891609";

// #region VERIFICATION

// Download the helper library from https://www.twilio.com/docs/node/install
const twilio = require("twilio"); // Or, for ESM: import twilio from "twilio";

// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

async function updateTollfreeVerification() {
  const tollfreeVerification = await client.messaging.v1
    .tollfreeVerifications("HH28e8c0262c402bc2dbc42a97de0af60b")
    .update({
      additionalInformation:
        "i am a student and i am building a personal project for personal use",
      businessCity: "New Orleans",
      businessContactEmail: "leo1812x@gmail.com",
      businessContactFirstName: "Leonardo",
      businessContactLastName: "Lopez",
      businessContactPhone: "+15046891609",
      businessCountry: "US",
      businessName: "Customer_Service_Handler",
      businessPostalCode: "70065",
      businessStateProvinceRegion: "LA",
      businessStreetAddress: "652 Vanderbilt Ln",
      businessStreetAddress2: "n/a",
      businessWebsite: "https://github.com/leo1812x/Customer_Service_Handler",
      messageVolume: "1,000",
      notificationEmail: "leo1812x@gmail.com",
      optInImageUrls: [
        "https://zipwhiptestbusiness.com/images/image1.jpg",
        "https://zipwhiptestbusiness.com/images/image2.jpg",
      ],
      optInType: "VERBAL",
      productionMessageSample: "lorem ipsum",
      useCaseCategories: ["TWO_FACTOR_AUTHENTICATION", "MARKETING"],
      useCaseSummary:
        "",
    });

  console.log(tollfreeVerification.sid);
}

// updateTollfreeVerification();



// #enregion
// #region TOKENS

/**
 * Creates a new ChatGrant with the specified service SID.
 * @param chat_service_sid - The SID of the service for which the grant is being created.
 * @returns A promise that resolves to a new ChatGrant object.
 */
async function create_grant(chat_service_sid:string):Promise<ChatGrant> {

    let grant = new ChatGrant({serviceSid: chat_service_sid});
    console.log("grant created");

    return grant;
}

/**
 * Creates an access token for Twilio services.
 * @param accountSid - The Account SID from your Twilio account.
 * @param api_key - The API key from your Twilio account.
 * @param api_key_seceret - The API key secret from your Twilio account.
 * @param identity - The identity of the user for whom the token is being created.
 * @param chat_service_sid - the Sid of the chat service
 * @returns A promise that resolves to an AccessToken object.
 */
async function create_accessToken(account_sid:string, api_key:string, api_key_seceret:string, identity:string, chat_service_sid:string):Promise<AccessToken> {

    let token = new AccessToken(account_sid, api_key, api_key_seceret, {identity});
    token.addGrant(await create_grant(chat_service_sid));

    console.log(token.toJwt());
    
    return token;
}

// #endregion
// #region conversation

/**
 * Creates a new conversation with the specified friendly name.
 * @param {string} friendly_name - The friendly name for the new conversation.
 * @returns {Promise<ConversationInstance>} A promise that resolves to the created conversation instance.
 */
async function create_conversation(friendly_name: string):Promise<ConversationInstance> {
    //* fetch get list of conversations
    const conversations: ConversationInstance[] = await fetch_list_Conversations();
    
    //* if conversation isn't empty
    if (conversations.length > 0){
        for (let i = 0; i < conversations.length; i++) {
            const conversation = conversations[i];

            //* if conversation already exists
            if (conversation.friendlyName === friendly_name){
                console.log(`${conversation.sid} Conversation already exists`);

                //* fetch and return conversation
                return conversation;
            }
        }
    }

    //* if conversation is empty or doesn't exist
    let conversation_instance = await CLIENT.conversations.v1.conversations.create({
        friendlyName: friendly_name,
    });
    console.log(`${conversation_instance.sid} coversation created`);
    return conversation_instance;
}

/**
 * Creates an SMS participant in the specified conversation.
 * @param {string} conversation_sid - The SID of the conversation where the participant will be created.
 * @param {string} number - The phone number of the participant.
 * @param {string} twilio_number - The Twilio phone number to be used as the proxy address.
 * @returns {Promise<string>} A promise that resolves to the SID of the created participant.
 */
async function create_conversation_participant_SMS(conversation_sid: string, number:string, twilio_number:string):Promise<ParticipantInstance> {
    const participant = await CLIENT.conversations.v1
    .conversations(conversation_sid)
    .participants.create({
      "messagingBinding.address": number,
      "messagingBinding.proxyAddress": twilio_number,
    });

    console.log(`${participant.sid} SMS participant created`);
    
    return participant;
}

/**
 * Creates a CHAT participant in the specified conversation.
 * Note: The TwilioBot class implements this method and should be used instead.
 * @param {string} conversation_sid - The SID of the conversation where the participant will be created.
 * @param {string} identity - The identity of the participant.
 * @returns {Promise<string>} A promise that resolves to the SID of the created participant.
 */
async function create_conversation_participant_CHAT(conversation_sid:string, identity:string):Promise<ParticipantInstance> {
    
    //* fetch list of participants
    const participants: ParticipantInstance[] = await fetch_list_participants(conversation_sid);
    
    //* if participants list isn't empty
    if (participants.length > 0){
        for (let i = 0; i < participants.length; i++) {
            const participant = participants[i];

            //* if participant already exists
            if (participant.identity === identity){
                console.log(`${participant.sid} participant already exists`);

                //* return participant     
                return participant;
            }
        }
    }
    
    const participant = await CLIENT.conversations.v1
        .conversations(conversation_sid)
        .participants.create({ identity: identity });
  
    console.log(`${participant.sid} chat participant created`);

    return participant;
}


/**
 * Fetches a conversation instance from Twilio using the provided conversation SID.
 * @param {string} conversation_sid - The SID or unique_name of the conversation to fetch.
 * @returns {Promise<ConversationInstance>} A promise that resolves to the fetched conversation instance.
 */
async function fetch_Conversation(conversation_sid: string): Promise<ConversationInstance> {
    
    const conversation = await CLIENT.conversations.v1
        .conversations(conversation_sid)
        .fetch();

    console.log(conversation.sid + " conversation was fetched");
    
    return conversation;
}


/**
 * Fetches a list of participants from a specified conversation.
 * @param {string} conversation_sid - The unique identifier for the conversation.
 * @returns {Promise<ParticipantInstance[]>} A promise that resolves to an array of ParticipantInstance objects.
 */
async function fetch_list_participants(conversation_sid: string): Promise<ParticipantInstance[]>{
    const participants = await CLIENT.conversations.v1
    .conversations(conversation_sid)
    .participants.list({ limit: 20 });

    console.log(participants.length + " participants fetched from: " + conversation_sid);

   return participants; 
}


/**
 * Fetches a participant from a conversation.
 * @param {string} conversation_sid - The SID of the conversation.
 * @param {string} identity - The identity of the participant.
 * @returns {Promise<ParticipantInstance>} A promise that resolves to the fetched participant instance.
 */
async function fetch_conversation_participant(conversation_sid: string, identity: string): Promise<ParticipantInstance> {
    const participant = await CLIENT.conversations.v1
        .conversations(conversation_sid)
        .participants(identity)
        .fetch();
  
        console.log(`${participant.sid} participant fetched`);
        
        return participant;
}

/**
 * fetches the conversations from my account
 * @returns {Promise<ConversationInstance[]>}an array with the current conversations
 */
async function fetch_list_Conversations(): Promise<ConversationInstance[]> {
    let conversations:ConversationInstance[] = await CLIENT.conversations.v1.conversations.list();
        
    console.log(`${conversations.length} fetched conversations`);
    
    return conversations;
}

/**
 * deletes a conversation
 * @param {string} conversationSid the sid of the conversation 
 */
async function delete_conversation(conversationSid: string) {
    try {
        let x = await fetch_Conversation(conversationSid);
        await CLIENT.conversations.v1.conversations(conversationSid).remove();
        console.log(`Conversation ${x.sid} has been deleted.`);
    } catch (error) {
        console.error('Error deleting conversation:', error);
    }
}

/**
 * Deletes all conversations in the Twilio account.
 * @returns {Promise<void>} A promise that resolves when all conversations are deleted.
 */
async function delete_all_conversations(): Promise<void> {
    const conversations = await fetch_list_Conversations();
    for (const conversation of conversations) {
        await delete_conversation(conversation.sid);
    }
}

/**
 * Sends a message to a specified conversation.
 * @param {string} conversation_sid - The SID of the conversation where the message will be sent.
 * @param {string} author - The identity of the sender.
 * @param {string} body - The content of the message.
 * @returns {Promise<void>} A promise that resolves when the message is sent.
 */
async function send_message(conversation_sid:string, author:string, body:string):Promise<void> {
    const message = await CLIENT.conversations.v1
        .conversations(conversation_sid)
        .messages.create({
            author: author,  // The identity of the participant sending the message
            body: body,      // The message content
        });

    console.log(`message: ${message.body} sent`);
}

/**
 * Removes a participant from a specified conversation.
 * @param {string} conversationSid - The SID of the conversation.
 * @param {string} participantSid - The SID of the participant to be removed.
 * @returns {Promise<void>} A promise that resolves when the participant is removed.
 */
async function delete_participant(conversationSid: string, participantSid: string): Promise<void> {
    try {
        await CLIENT.conversations.v1
            .conversations(conversationSid)
            .participants(participantSid)
            .remove();

        console.log(`${participantSid} participant has been removed from conversation ${conversationSid}.`);
    } catch (error) {
        console.error('Error removing participant:', error);
    }
}


// #endregeion
// #region WHATSAPP

/**
 * Sends a WhatsApp message using the Twilio API.
 * @param body - The content of the message to be sent.
 * @param number_from - The sender's phone number in E.164 format.
 * @param number_to - The recipient's phone number in E.164 format.
 */
async function create_whatsapp_message(body:string, number_from:string, number_to:string) {
    const message = await CLIENT.messages.create({
        body: body,
        from: number_from,
        to: number_to,
    });
    
      console.log("whatsapp message sent");
}


// #endregion
// #region CLASSES

/**
 * Creates an instance of TwilioBot
 * @param {string} conversationSid - The unique identifier for the conversation.
 * @param {string} identity - The identity of the participant (e.g., bot or user).
 */
class TwilioBot{
    private sid = "";

    constructor( public conversation_Sid: string, public identity: string){}

    /**
     * Initializes the CHAT bot
     * @returns {Promise<void>} A promise that resolves when the initialization is complete.
     */
    async initialize() {          
        this.sid = (await create_conversation_participant_CHAT(this.conversation_Sid, this.identity)).sid;
        console.log(this.sid + " TwilioBot is initialized");
    }

    /**
     * Sends a message to the conversation where the bot lives.
     * @param body - The content of the message to be sent.
     */
    async send_message(body: string) {
        if (!this.conversation_Sid) {
            throw new Error("Client is not initialized. Call 'initialize()' first.");
        }

        await send_message(this.conversation_Sid, this.identity, body);
    }

    /**
     * Retrieves a participant instance from a conversation.
     *
     * @returns {Promise<ParticipantInstance>} A promise that resolves to the participant instance.
     */
    async get(): Promise<ParticipantInstance>{
        let participant = await fetch_conversation_participant(this.conversation_Sid, this.identity);

        console.log(`${this.sid} participant was getted`);
        return participant;
    }

    async create_accessToken(){        
        //* get service_sid
        let service_sid = await (await fetch_Conversation(this.conversation_Sid)).chatServiceSid 
        
        console.log(this.identity, service_sid, "-------");
        
        create_accessToken(ACCOUNT_SID, API_KEY, API_KEY_SECRET, this.identity, service_sid);   
    }
}


/**
 * creates a conversation
 * @param {string} name name for the conversation
 */
class Twilio_Conversation{
    public sid:string = "";
    constructor(private name: string){}

    /**
     * Initializes the Twilio handler by retrieving the list of conversations
     * and checking if a conversation with the specified unique name already exists.
     * @returns {Promise<void>} A promise that resolves when the initialization is complete.
     */
    async initialize(){
        //? move this functionality to createConversation
        this.sid = (await create_conversation(this.name)).sid;
        console.log(this.sid + " conversation is initialized");
    }

    /**
     * Retrieves a conversation instance based on the current object's name.
     * @returns {Promise<ConversationInstance>} A promise that resolves to a ConversationInstance.
     */
    async get(): Promise<ConversationInstance>{      
        let x = await fetch_Conversation(this.sid);

        console.log(x.sid + " conversation was getted");
        
        return x;
    }

    /**
     * Creates a new Twilio bot instance and initializes it.
     *
     * @param identity - The unique identifier for the Twilio bot.
     * @returns A promise that resolves to the created TwilioBot instance.
     */
    async create_twilio_bot(identity:string):Promise<TwilioBot>{
        let bot = new TwilioBot(this.sid, identity);
        await bot.initialize();

        return bot;
    }

    async create_SMS_participant(participant_number:string):Promise<ParticipantInstance>{
        let instance = await create_conversation_participant_SMS(this.sid, participant_number, TWILIO_NUMBER);

        return instance;
    }

    async delete_conversation(){
        delete_conversation(this.sid);
    }

}

class Twilio_Conversation_Double{
    constructor(private name: string){}

    async intialize(owner_phone:string, customer_phone:string){
        //* create customer-bot conversation
        let conversation_customer_bot = new Twilio_Conversation("customer_bot_conversation");
        await conversation_customer_bot.initialize();
        
        //* create bot-me conversation
        let conversation_bot_me = new Twilio_Conversation("bot_me_conversation");
        await conversation_bot_me.initialize();        

        //* create and add bot to both conversations
        let bot_customer_bot = await conversation_customer_bot.create_twilio_bot("bot");
        let bot_bot_me = await conversation_bot_me.create_twilio_bot("bot");
        
        //* create me number on bot-me conversation
        let participant_SMS_me = await conversation_customer_bot.create_SMS_participant(owner_phone);
        
        //* create customer number on customer-bot conversation
        let participant_SMS_customer = await conversation_customer_bot.create_SMS_participant(customer_phone);
        
        //* create access token for bot
        await bot_bot_me.create_accessToken();
        


        await sleep(1000 * 60);
        //*delete conversations
        await conversation_bot_me.delete_conversation();
        await conversation_customer_bot.delete_conversation();
    }
}


// #endregion conversations
// #region TESTING

await delete_all_conversations();

let test = new Twilio_Conversation_Double("test_conversation_double");
await test.intialize(MY_NUMBER, "+15046891608");
