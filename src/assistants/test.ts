// #region SCHEMAS

import OpenAI from "openai";
import { QuickLogger } from "../logging";

const key = process.env.OPENAI_KEY;
const openai = new OpenAI({ apiKey: key });

const logger = new QuickLogger("openAI_sdk");


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

// #region ASSISTANT
/**
 * Creates an assistant using OpenAI's beta API.
 * @returns {Promise<OpenAI.Beta.Assistant>} the created assistant.
 */
async function create_asistant(company: Company): Promise<OpenAI.Beta.Assistant> {
    const assistant = await openai.beta.assistants.create({
        model: company.model,
        instructions:
            company.instructions,
        tools: [
            {
                type: "function",
                function: return_name_stored_schema
            },
        ],
    });
    logger.openAI_sdk("asistant created");

    return assistant;
}

type Tool = {
    type: OpenAI.Beta.FunctionTool
    function: OpenAI.FunctionDefinition;
};


export class Company {
    public model: string;
    public instructions: string;
    public tools: OpenAI.Beta.Assistants.AssistantTool[];

    constructor(model: string, instructions: string, ...tools: OpenAI.Beta.Assistants.AssistantTool[]) {
        this.model = model;
        this.instructions = instructions;
        this.tools = tools;
    }

    initialize(){

    }
}

//#region testing area













