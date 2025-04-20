import dotenv from 'dotenv';
dotenv.config();




export interface Config  {
    env : 'testnet' | 'mainnet',
    storage : string;
    pkg : string;
    operator : string, 
}



function getValidEnv(name :string){
    let value = process.env[name]
    if(value == null || value.length == 0){
        console.log(`export ${name}= ....`);
        process.exit(-1);
    }
    return value;
}
export  function getSuiConfig()  : Config{
    const env = getValidEnv('SUI_NET') == 'mainnet' ? 'mainnet' : 'testnet';
    const pkg =  getValidEnv('PACKAGE');
    const operator = getValidEnv('OPERATOR');
    const storage = getValidEnv('STORAGE')

    return {
        env,
        pkg,
	    storage,
        operator,
    }   
}