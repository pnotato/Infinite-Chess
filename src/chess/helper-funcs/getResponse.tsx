import OpenAI from "openai";

async function getResponse(inputString: string){
    const openai = new OpenAI({
        apiKey: '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',
        dangerouslyAllowBrowser: true
    });

    const prompt = 'respond with a singular emoji representing the following text: ';

    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: prompt
            },
            {
                role: 'user',
                content: inputString
            }
        ]
    })

    console.log(response);
    return response.choices[0].message.content;
}

export default getResponse;
