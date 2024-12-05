import { env, serve } from 'bun';
import { QuickLogger } from './src/logging';
import { Twilio_openAI } from './src/handlers/twilio_handler';
import { Insta_openAI } from './src/handlers/insta_handler';
import { test_company } from './src/assistants/companies';

//* logger
const logger = new QuickLogger("testing");

//*INSTAGRAM ID
const IG_ID = process.env.IG_ID;

//#region TESTING

//* twilio
// let monster = new Twilio_openAI();
// await monster.initialize("+15046891609");
// await monster.create_accessToken();

//* instagram
let insta_bot = new Insta_openAI(test_company);
await insta_bot.initialize();



//#region TWILIO SERVER
const server = serve({
	port: 80, // The port your server will listen on
	async fetch(req) {
		// Extract only the path for comparison, regardless of protocol or host
		const url = new URL(req.url);

		// logger.server("Received request: ", req.method, url.pathname);

		//? i need to validate the request before i deploy
		//* if /webhook
		if (req.method === "POST" && url.pathname === "/webhook") { // Compare only the path
			
			//*get data
			const data = new URLSearchParams(await req.text());
			const data_object = Object.fromEntries(data.entries());
			
			//*print full data
			logger.server("Request body: ", data_object.Body);

			//*get the author
			const author = data_object.Author;

			//*if no conversation with author, create
			// const new_ = new Monster_Class();
			// await new_.initialize(author);
			

			//* if messageAdded
			if  (data_object.EventType === "onMessageAdded"){
				// await monster.create_answer(data_object.Body);
			}


			//* print sms participant
			// await monster.fetch_sms_participants();

			return new Response(data, { status: 200 });
		}
		return new Response(`Not webhook, url: ${url.pathname}`, { status: 200 });
	},
});

logger.server("Bun web server at http://localhost:80");

//#region Server 2





const server2 = serve({
    port: 8080,
    async fetch(req) {
        // Parse the request URL
        const url = new URL(req.url);
        logger.server("Request URL: ", url.toString());

		//* handle new webhook creation
        const hubChallenge = url.searchParams.get('hub.challenge');
        if (hubChallenge) {
            // Return the hub.challenge parameter
            return new Response(hubChallenge, { status: 200 });
        } 

		if (req.method === "POST" && url.pathname === "/webhook") {
			try {
				//*grab message
				const rawData = await req.text();
				const data = JSON.parse(rawData);
				const messaging_data = data.entry[0].messaging[0]
				

				//*if webhook is message and sender isnt me:
				if (messaging_data.message && messaging_data.sender.id !== IG_ID){
					const incomming_message = {
						sender: data.entry[0].messaging[0].sender.id,
						message: data.entry[0].messaging[0].message.text
					}
					insta_bot.handle_message(incomming_message.sender, incomming_message.message);
				}				

				//*if webhook is read:
				if (messaging_data.read){
					console.log("mensaje visto");
					
				}
		
			} catch (error) {
				console.error("Failed to parse JSON:", error);
			}
		}
		
		// && messaging_data.sender.id !== IG_ID
		

		return new Response("end", { status: 200 });
    }
});


logger.server("Bun web server2 at http://localhost:8080");




































