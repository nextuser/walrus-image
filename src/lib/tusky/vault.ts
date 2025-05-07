import dotenv from 'dotenv'
import { stringify } from 'querystring';
dotenv.config();

const apiKey = process.env.TUSKY_API_KEY
if(!apiKey){
    console.error('export TUSKY_API_KEY=  first');
    process.exit(-1)
}

export function getTuskeyApiKey(){
    return apiKey!
}

const body = JSON.stringify({
    name: 'image',
  });

fetch('https://api.tusky.io/vaults', {
    method: 'POST',
    headers: {
      'Api-Key': apiKey,
      'Content-Type': 'application/json'
    },
    body: body,
  }).then((response)=>{
    response.text().then((vault)=>{
        console.log('vault result:',vault);
    });
  });
