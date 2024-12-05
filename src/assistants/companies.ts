import OpenAI from "openai";
import { QuickLogger } from "../logging";
import { OpenAI_Asistant } from "../sdk/openai_sdk";

//*openai
const key = process.env.OPENAI_KEY;
const openai = new OpenAI({ apiKey: key });

//*loggger
const logger = new QuickLogger("openAI_sdk");

// #region SCHEMAS
const return_name_stored_schema: OpenAI.FunctionDefinition = {
    name: "return_name_stored",
    description: "gets the stored name when passes the 2 right passwords",
    parameters: {
        type: "object",
        properties: {
            password_1: {
                type: "string",
                description: "the first required password",
            },
            password_2: {
                type: "string",
                description: "the second required password",
            },
        },
        required: ["password_1", "password_2"],
        additionalProperties: false
    },
    strict: true,
}
async function return_name_stored(password_1: string, password_2: string): Promise<string> {
    if (password_1 === "123" && password_2 === "456") {
        return "leo";
    }

    if (password_1 === "leo" && password_2 === "leo") {
        return "leopoldo";
    }

    return "wrong password";
}

const tool:OpenAI.Beta.Assistants.AssistantTool = {
    type: "function",
    function: return_name_stored_schema
}






//#region CLASS
export class Company {
    public model: OpenAI.Chat.ChatModel;
    public instructions: string;
    public tools: OpenAI.Beta.Assistants.AssistantTool[];

    constructor(model: OpenAI.Chat.ChatModel, instructions: string, ...tools: OpenAI.Beta.Assistants.AssistantTool[]) {
        this.model = model;
        this.instructions = instructions;
        this.tools = tools;
    }
}

//#region TESTING
export const test_company = new Company("gpt-4o", "you are a bot that i am testing", tool);











