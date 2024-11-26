import { fetch } from 'bun';
import { QuickLogger } from '../logging';

const ACCESS_TOKEN = process.env.ACCESS_TOKEN!;
const IG_ID = "17841470666117265" //gotten by getting fetchInstagramData(ACCESS_TOKEN.user_id);
const PERSONAL_IGSID = "536785206002018"; 

let logger = new QuickLogger("instagram_sdk");

//#region SETUP

/**
 * Fetches Instagram user data using the provided access token.
 * @param {string} access_token - The access token for authenticating the request to the Instagram Graph API.
 * @returns {Promise<any>} A promise that resolves to the Instagram user data.
 * @throws Will throw an error if the fetch request fails or the response is not ok.
 */
async function fetch_instagram_data(access_token: string) {
    const url = `https://graph.instagram.com/v21.0/me?fields=user_id,username,name,account_type,followers_count,follows_count,media_count&access_token=${access_token}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        logger.instagram_sdk(data);
        return data;
    } catch (error) {
        console.error('Failed to fetch Instagram user data:', error);
        throw error;
    }
}

async function fetch_instagram_media(access_token:string, IG_ID:string) {
    const url = `https://graph.instagram.com/v21.0/${IG_ID}/media?access_token=${access_token}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        logger.instagram_sdk(data);
        return data;
    } catch (error) {
        console.error('Failed to fetch Instagram media:', error);
        throw error;
    }
}

//*SET UP WEBHOOKS
/**
 * Subscribes to all Instagram fields for a given Instagram user ID.
 * @param {string} access_token - The access token for authenticating the request.
 * @param {string} ig_id - The Instagram user ID to subscribe to.
 * @returns {Promise<any>} A promise that resolves to the response data from the Instagram API.
 * @throws Will throw an error if the subscription request fails.
 */
async function subscribe_instagram_fields(access_token:string, ig_id:string) {
    const url = `https://graph.instagram.com/v21.0/${ig_id}/subscribed_apps?subscribed_fields=comments,messages,live_comments,message_reactions,messages,messaging_optins,messaging_postbacks,messaging_referral,messaging_seen&access_token=${access_token}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        logger.instagram_sdk(data);
        return data;
    } catch (error) {
        console.error('Failed to subscribe to Instagram fields:', error);
        throw error;
    }
}

// subscribeToInstagramFields(ACCESS_TOKEN, IG_ID);



/**
 * Sends a message to a specified Instagram user.
 * @param my_ig_id - The Instagram ID of the sender.
 * @param text - The text message to be sent.
 * @param recipient_IGSID - The Instagram ID of the recipient.
 * @returns A promise that resolves to the response data from the Instagram API.
 * @throws Will throw an error if the message fails to send.
 */
async function send_instagram_message(my_ig_id:string, text:string, recipient_IGSID:string) {
    const url = `https://graph.instagram.com/v21.0/${my_ig_id}/messages`;
    const body = JSON.stringify({
        recipient: {
            id: recipient_IGSID
        },
        message: {
            text: text
        }
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: body
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        logger.instagram_sdk("message sent");
        return data;
    } catch (error) {
        console.error('Failed to send Instagram message:', error);
        throw error;
    }
}



//#region CONVERSATIONS

/**
 * Fetches Instagram conversations for the authenticated user.
 * @param {string} access_token - The access token for authenticating the request.
 * @returns {Promise<any>} A promise that resolves to the data containing Instagram conversations.
 * @throws Will throw an error if the fetch operation fails or if the response is not ok.
 */
async function fetch_instagram_conversations(access_token: string):Promise<any> {
    const url = `https://graph.instagram.com/v21.0/me/conversations?platform=instagram&access_token=${access_token}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        // logger.level_1(data);
        return data;
    } catch (error) {
        console.error('Failed to fetch Instagram conversations:', error);
        throw error;
    }
}
// Example usage
// fetchInstagramConversations(ACCESS_TOKEN);



/**
 * Fetches the Instagram conversation ID associated with a given user ID.
 * @param access_token - The access token for authenticating the request.
 * @param user_id - The user ID for which to fetch the conversation ID.
 * @returns A promise that resolves to the conversation ID as a string.
 * @throws Will throw an error if the request fails or if the response is not ok.
 */
async function fetch_instagram_ConversationID_with_userID(access_token: string, user_id: string): Promise<string> {
    const url = `https://graph.instagram.com/v21.0/me/conversations?user_id=${user_id}&access_token=${access_token}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.data[0].id;
        
    } catch (error) {
        console.error('Failed to fetch Instagram conversations by user:', error);
        throw error;
    }
}

// const conversation_id = await fetch_instagram_Convers2ationID_with_userID(ACCESS_TOKEN, PERSONAL_IGSID);
// logger.level_1(conversation_id);



/**
 * Fetches messages from an Instagram conversation.
 * @param access_token - The access token for authenticating the request.
 * @param conversation_id - The ID of the Instagram conversation to fetch messages from.
 * @returns A promise that resolves to the conversation messages data.
 * @throws Will throw an error if the request fails.
 */
async function fetch_instagram_messages(access_token: string, conversation_id: string): Promise<any> {
    const url = `https://graph.instagram.com/v21.0/${conversation_id}?fields=messages&access_token=${access_token}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        logger.instagram_sdk(data);
        return data;
    } catch (error) {
        console.error('Failed to fetch Instagram conversation messages:', error);
        throw error;
    }
}

async function fetch_instagram_last_messageID(access_token: string, conversation_id: string): Promise<string> {
    const url = `https://graph.instagram.com/v21.0/${conversation_id}?fields=messages&access_token=${access_token}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        logger.instagram_sdk(data);
        return data.messages.data[0].id;
    } catch (error) {
        console.error('Failed to fetch Instagram last message:', error);
        throw error;
    }
}






async function fetch_instagram_message_details(access_token: string, message_id: string): Promise<any> {
    const url = `https://graph.instagram.com/v21.0/${message_id}?fields=id,created_time,from,to,message&access_token=${access_token}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        logger.instagram_sdk(data);
        return data;
    } catch (error) {
        console.error('Failed to fetch Instagram message details:', error);
        throw error;
    }
}

// Example usage
// const MESSAGE_ID = await fetch_instagram_last_messageID(ACCESS_TOKEN, await fetch_instagram_ConversationID_with_userID(ACCESS_TOKEN, PERSONAL_IGSID) ); // Replace with the actual message ID
// const test = await fetch_instagram_message_details(ACCESS_TOKEN, MESSAGE_ID);
// logger.testing(test);


//#region CLASSES   

export class Insta_bot{
    constructor() {}

    answer(recipient_id: string, message:string){
        send_instagram_message(IG_ID, message, recipient_id);
    }
}



















