import { SuiGraphQLClient } from '@mysten/sui/graphql';
import { graphql } from '@mysten/sui/graphql/schemas/latest';
 
const gqlClient = new SuiGraphQLClient({
	url: 'https://sui-testnet.mystenlabs.com/graphql',
});
 
const chainIdentifierQuery = graphql(`
	query {
		chainIdentifier
	}
`);
 
async function getChainIdentifier() {
	const result = await gqlClient.query({
		query: chainIdentifierQuery,
	});
 
	return result.data?.chainIdentifier;
}

const getSuinsName = graphql(`
	query getSuiName($address: SuiAddress!) {
		address(address: $address) {
			defaultSuinsName
		}
	}
`);
 
async function getDefaultSuinsName(address: string) {
	const result = await gqlClient.query({
		query: getSuinsName,
		variables: {
			address,
		},
	});
 
	return result.data?.address?.defaultSuinsName;
}

const queryEpoch = graphql(`
	query { epoch { referenceGasPrice } }
`);

getChainIdentifier().then(console.log)

//getDefaultSuinsName('0xafe36044ef56d22494bfe6231e78dd128f097693f2d974761ee4d649e61f5fa2').then((value)=>console.log('get sui name',value))
gqlClient.query({
	query: queryEpoch,
}).then(console.log);

const ql =  graphql(` query ($epochID: Int) {
	epoch(id: $epochID) {
	  referenceGasPrice
	}
  },`);
gqlClient.query({query:ql,variables:{ epochID : 2}}).then(console.log);
