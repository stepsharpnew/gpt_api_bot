#Hello my dears!

Today we create gpt_bot

```JavaScript
const response = await axios.get(
            `https://llm.api.cloud.yandex.net:443/operations/${id_art}`,
            {
                headers: {
                    'Authorization': `Api-Key ${gpt_api_key}`,
                },
            }
        );
```