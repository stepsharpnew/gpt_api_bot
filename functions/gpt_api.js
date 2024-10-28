const axios = require('axios')
require('dotenv').config()
const {logToFile} = require ("../functions/to_log_file")


let new_prompt = ""
let new_req_body = []
let req_body = []
let count = 1
const gpt_api_key = process.env.GPT_API_KEY

function NewChat(){
    new_prompt = ""
    count = 1
}


async function getGptResponse(prompt) {
    try {
        console.log(prompt);
        if (count != 1){
            req_body.messages.push(
                {
                    "role" : "user",
                    "text" : prompt
                }
            )
        }
        count = count + 1
        if(new_prompt == ""){
            req_body = {
                "modelUri": "gpt://b1gbjg6mae3tfqt14r83/yandexgpt/latest",
                "completionOptions": {
                    "temperature": 0.7,
                    "maxTokens": 2000
                },
                "messages": [
                    {
                        "role": "system",
                        "text": "Ты умный ассистент"
                    },
                    {
                        "role": "user",
                        "text": prompt 
                    }
                ]
            }     
        }else {
            req_body = new_req_body          
        }
        new_prompt = prompt
        const response = await axios.post('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', 
        req_body,
        {
            headers: {
                'Authorization': `Api-Key ${gpt_api_key}`,
                'Content-Type': 'application/json'
            }
        });

        let new_text = ""

        if (response.data && response.data.result && Array.isArray(response.data.result.alternatives)) {
            const alternatives = response.data.result.alternatives;
            new_text = response.data.result.alternatives[0].message.text
        
            console.log(count);
            if (count != 2){
                req_body.messages.push(
                    {
                        "role" : "assistant",
                        "text" : new_text
                    },
                )
            } 
            new_req_body = req_body


                console.log(req_body.messages);
                logToFile(`${req_body.messages[req_body.messages.length - 1].text}`);
                return alternatives[0].message.text;
                                    
                 // const finalAlternative = alternatives.find(alt => alt.status === "ALTERNATIVE_STATUS_FINAL");
            // if (finalAlternative) {
            //     console.log("Two");
            //     return finalAlternative.message.text;
            // } else {
            //     console.log("Third");
            //     return alternatives[0].message.text;

            // }
        } else {
            console.error("Error fetching GPT response:", error);
            return "Произошла ошибка при получении ответа.";
        }

    } catch (error) {
        console.error("Error fetching GPT response:", error);
        return "Произошла ошибка при получении ответа.";
    }
}

module.exports = { getGptResponse, new_prompt,NewChat }