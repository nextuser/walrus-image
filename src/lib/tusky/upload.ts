import  fs from 'fs'
import { Tusky } from "@tusky-io/ts-sdk";
import { getTuskeyApiKey } from './vault';
import { getVaultId } from './sdk';
import { getSigner } from '../utils/tests/local_key';
import { getContentTypeByExtType ,getMimeTypeByContentType} from '../utils/content';


const jpgfile = '/mnt/d/files/zhang3.jpg'

//const vaultId = '01f339bf-f7b7-4676-9d4c-138e8c7cb1a8'
const vault_name = 'image'

const tusky = new Tusky({ apiKey:  getTuskeyApiKey()});
//const tusky = new Tusky({ wallet: { keypair:getSigner() } });


async function upload(filePath :string){
  const vault_id = await getVaultId(vault_name);

  const fileStats = fs.statSync(filePath);
  const fileSize = fileStats.size;
  const fileName = filePath.split('/').pop()!;
  const  ext = fileName.split('.').pop() || 'bin'
  const mimetype = getMimeTypeByContentType(getContentTypeByExtType(ext))
  const fileStream = fs.createReadStream(filePath);

  console.log('upload file id =',vault_id)
  return tusky.file.upload(vault_id!,fileStream,{name:'abc',mimeType: mimetype}).then((value)=>{
    console.log('upload result : ',value)
    return value;
  })
}

async function download( uploadId:string, outPath : string){
  const fileMetadata = await tusky.file.get(uploadId);
  console.log("File blob meta: " + fileMetadata.blobId , fileMetadata.id,fileMetadata.mimeType,fileMetadata.name ,fileMetadata.owner);
  const buffer = await tusky.file.arrayBuffer(uploadId);
  fs.writeFileSync(outPath,Buffer.from(buffer))
  console.log('file write in ',outPath);
}

const zone8_ms = 8 * 60 * 60 * 1000;
async function queryVaults(){
  ///await tusky.auth.signIn();
   tusky.file.listAll().then( (files)=>{
      for(let  [i,v] of files.entries()){
        console.log('files ', i ,v.name);
        console.log('created ', new Date(Number(v.createdAt) + zone8_ms))
        console.log('updated ', new Date(Number(v.updatedAt) + zone8_ms))
        console.log('size',v.size)
        console.log('blobId',v.blobId)
        
      }
      console.log('queryVaults count', files.length)
   })
}

async  function test_upload_download(){
   ///await tusky.auth.signIn();
   let uploadId = await upload(jpgfile);
   let out = "/mnt/d/o.jpg"
   await download(uploadId, out)
   
}


// test().then( ()=>
//   queryVaults()
// )

async function tests(){
  //tusky.auth.signIn();
  //await test_upload_download();
  await queryVaults();
}


tests();





