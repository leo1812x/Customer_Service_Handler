import OpenAI from "openai";
const key = process.env.OPENAI_KEY;


const openai = new OpenAI({
  apiKey: key
});


async function main(message:string) {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: message }],
      model: "gpt-3.5-turbo",
    });
  
    console.log(completion.choices[0].message.content);
  }

//main("ask chatgpt some shit");