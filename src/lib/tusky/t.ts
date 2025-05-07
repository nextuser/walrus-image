async function test(){
  const response = await fetch('https://api.tusky.io/vaults', {
  method: 'POST',
  headers: {
    'Api-Key': process.env.TUSKY_API_KEY,
  },
  body: {
    name: 'image',
  },
});

const vault = await response.json();
console.log(vault);	
}


test();
