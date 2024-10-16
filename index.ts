import { serve } from 'bun';
import ngrok from '@ngrok/ngrok';

let ngrokUrl: string | null = null;

const server = serve({
	port: 8080, // The port your server will listen on
	async fetch(req) {
		// Extract only the path for comparison, regardless of protocol or host
		const url = new URL(req.url);



		console.log("Received request: ", req.method, url.pathname);
		console.log("Expected request: ", req.method, "/webhook");

		if (req.method === "POST" && url.pathname === "/webhook") { // Compare only the path
			return new Response(`/webhook received at ${url.pathname}}`, { status: 200 });
		}

		return new Response(`Not webhook, url: ${url.pathname}`, { status: 200 });
	},
});




console.log("Server is running on http://localhost:8080");
console.log('Bun web server at 8080 is running...');

ngrok.connect({ addr: 8080, authtoken_from_env: true })
	.then(listener => {
		ngrokUrl = listener.url();
		console.log(`Ingress established at: ${ngrokUrl}`);
	})
	.catch(err => {
		console.error('Error establishing ngrok connection:', err);
	});





































