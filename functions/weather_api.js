const axios = require('axios');
require('dotenv').config()
weather_api_key = process.env.WEATHER_API
async function get_weather_data(){
    const options = {
        method: 'GET',
        url: 'https://meteostat.p.rapidapi.com/stations/hourly',
        params: {
          station: '10637',
          start: '2024-05-21',
          end: '2024-05-21',
          tz: 'Europe/Moscow'
        },
        headers: {
          'X-RapidAPI-Key': `${weather_api_key}`,
          'X-RapidAPI-Host': 'meteostat.p.rapidapi.com'
        }
      };
      
      try {
          const response = await axios.request(options);
        //   console.log(response.data);
      } catch (error) {
          console.error(error);
      }
}



weather_api_key = process.env.WEATHER_API
async function get_weather_data_station(){
    const options = {
        method: 'GET',
        url: 'https://meteostat.p.rapidapi.com/stations/nearby?lat=51.5085&lon=-0.1257&limit=15',
        headers: {
          'X-RapidAPI-Key': `${weather_api_key}`,
          'X-RapidAPI-Host': 'meteostat.p.rapidapi.com'
        }
      };
      
      try {
          const response = await axios.request(options);
          for (let index = 0; index < response.data.data.length ; index++) {
            console.log(response.data.data[index].name.en);
            
          }

      } catch (error) {
          console.error(error);
      }
}
module.exports = {get_weather_data,get_weather_data_station}