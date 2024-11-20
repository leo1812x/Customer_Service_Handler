import { fetch } from 'bun';

const ACCESS_TOKEN = process.env.ACCESS_TOKEN!;
const IG_ID = "17841470666117265" //gotten by getting fetchInstagramData(ACCESS_TOKEN.user_id);

//#region SETUP

async function fetchInstagramData(access_token: string) {
    const url = `https://graph.instagram.com/v21.0/me?fields=user_id,username,name,account_type,followers_count,follows_count,media_count&access_token=${access_token}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Failed to fetch Instagram user data:', error);
        throw error;
    }
}

// fetchInstagramData(ACCESS_TOKEN);

async function fetchInstagramMedia(access_token:string, IG_ID:string) {
    const url = `https://graph.instagram.com/v21.0/${IG_ID}/media?access_token=${access_token}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Failed to fetch Instagram media:', error);
        throw error;
    }
}

// fetchInstagramMedia(ACCESS_TOKEN, IG_ID);


//#region WEBHOOKS

//*set up
/**
 * Subscribes to all Instagram fields for a given Instagram user ID.
 * @param {string} access_token - The access token for authenticating the request.
 * @param {string} ig_id - The Instagram user ID to subscribe to.
 * @returns {Promise<any>} A promise that resolves to the response data from the Instagram API.
 * @throws Will throw an error if the subscription request fails.
 */
async function subscribeToInstagramFields(access_token:string, ig_id:string) {
    const url = `https://graph.instagram.com/v21.0/${ig_id}/subscribed_apps?subscribed_fields=comments,messages,live_comments,message_reactions,messages,messaging_optins,messaging_postbacks,messaging_referral,messaging_seen&access_token=${access_token}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Failed to subscribe to Instagram fields:', error);
        throw error;
    }
}

// subscribeToInstagramFields(ACCESS_TOKEN, IG_ID);



async function sendInstagramMessage(my_ig_id:string, text:string, recipient_IGSID:string) {
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
        console.log(data);
        return data;
    } catch (error) {
        console.error('Failed to send Instagram message:', error);
        throw error;
    }
}












