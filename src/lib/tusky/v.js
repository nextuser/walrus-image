const response = await fetch('https://api.tusky.io/vaults', {
  method: 'POST',
  headers: {
    'Api-Key': '77d17fac-1ccc-4d04-9989-96b7dfc417dc',
  },
  body: {
    Name: 'image',
  },
});

console.log(await response.json())

