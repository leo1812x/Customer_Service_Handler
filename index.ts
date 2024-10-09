import { twiml } from 'twilio';

const { MessagingResponse } = twiml;

Bun.serve({
    port: 3000,
    fetch(req: Request) {
      return new Response("Success!");
    },
  });




















































