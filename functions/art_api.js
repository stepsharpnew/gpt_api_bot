const axios = require('axios');
require('dotenv').config()
const fs = require('fs');
const {logToFile} = require ("../functions/to_log_file")

const gpt_api_key = process.env.GPT_API_KEY
let id_art 
let Photo

async function getGptArt(prompt) {
    try {
        let random = Math.floor(Math.random() * Math.pow(2, 32));
        // console.log(random); // Случайное число от 0 до 2^32–1
        let payload = {
            "modelUri": "art://b1gbjg6mae3tfqt14r83/yandex-art/latest",
            "generation_options": {
                "mime_type": "image/jpeg",
                "seed":random
            },
            "messages": [
                {
                    "text": prompt,
                    "weight": 1.0
                }
            ],
        };

        const response = await axios.post(
            'https://llm.api.cloud.yandex.net/foundationModels/v1/imageGenerationAsync',
            payload,
            {
                headers: {
                    'Authorization': `Api-Key ${gpt_api_key}`,
                    'Content-Type': 'application/json'
                },
            }
        );

        // Проверка наличия ошибки
        if (response.data.error) {
            console.error("Error response from GPT API:", response.data.error);
            return "Ошибка при получении изображения";
        }
        // Обработка успешного ответа
        id_art = response.data.id
        console.log(response.data.id);
        const result = response
        return result

    } catch (error) {
        if (error.response) {
            console.error("Error response data:", error.response.data);
            console.error("Error response status:", error.response.status);
        } else {
            console.error("Error message:", error.message);
        }
        return "Ошибка при получении изображения";
    }
}

async function CheckGenerateImage(id_art){
    try{
        const response = await axios.get(
            `https://llm.api.cloud.yandex.net:443/operations/${id_art}`,
            {
                headers: {
                    'Authorization': `Api-Key ${gpt_api_key}`,
                },
            }
        );
        
        const imageBase64 = response.data.response.image;
        const imageBuffer = Buffer.from(imageBase64, 'base64');
        // Save the buffer to a JPEG file
        fs.writeFile('image.jpeg', imageBuffer, (err) => {
            if (err) throw err;
            console.log('The image has been saved as image.jpeg!');
        });
        return imageBuffer;
    } catch (error) {
        error_text = "Подождите немного, изображение ещё не создалось...\nПроверьте ещё раз /check"
        return error_text
    }


}


module.exports = {CheckGenerateImage,getGptArt,Photo}