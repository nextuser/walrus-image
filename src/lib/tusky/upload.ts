import  fs from 'fs'

import { getVaultId } from './sdk';
import { getSigner } from '../utils/tests/local_key';
import { getContentTypeByExtType ,getMimeTypeByContentType} from '../utils/content';
import { getServerTusky } from './tusky_server';
const tusky = getServerTusky();
const jpgfile = '/mnt/d/files/zhang3.jpg'

//const vaultId = '01f339bf-f7b7-4676-9d4c-138e8c7cb1a8'
const vault_name = 'image'


//const tusky = new Tusky({ wallet: { keypair:getSigner() } });


async function upload(filePath :string){
  const vault_id = await getVaultId(vault_name);
  console.log('vault id:',vault_id);
  const fileStats = fs.statSync(filePath);
  const fileSize = fileStats.size;
  const fileName = filePath.split('/').pop()!;
  const  ext = fileName.split('.').pop() || 'bin'
  const mimetype = getMimeTypeByContentType(getContentTypeByExtType(ext))
  const fileStream = fs.createReadStream(filePath);

  console.log('upload file id =',vault_id)
  return tusky.file.upload(vault_id!,fileStream,{name:'abc',mimeType: mimetype}).then((fileId)=>{
    console.log('fileId : ',fileId)
    return fileId;
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
async function queryFiles(){
  
  ///await tusky.auth.signIn();
   tusky.file.listAll().then( (files)=>{
      for(let  [i,v] of files.entries()){
        console.log('files ', i ,v.name);
        console.log('created ', new Date(Number(v.createdAt) + zone8_ms))
        console.log('updated ', new Date(Number(v.updatedAt) + zone8_ms))
        console.log('size',v.size)
        console.log('blobId',v.blobId)
        
      }
      console.log('queryFiles count', files.length)
   })
}

async  function test_upload_download(){
   ///await tusky.auth.signIn();
   let uploadId = await upload(jpgfile);
   let out = "/mnt/d/o.jpg"
   await download(uploadId, out)
   
}


async function queryVaultFiles(vaultId : string){
  tusky.file.list({vaultId: vaultId, status : 'active'}).then((files)=>{
    for(let f of files.items){
      console.log("name,id,size",f.name, f.id, f.size)
    }
  })
}
//https://app.tusky.io/vaults/c10ac34f-780d-4e5f-8db2-c8c4ec24f406/assets/gallery#f85b8603-365f-4910-b20f-5a8d385706b1

function getUrl(vault_id:string, file_id : string){
  return  `https://app.tusky.io/vaults/${vault_id}/assets/gallery#${file_id}`;
}
async function queryVaultByName(name : string){
  return tusky.vault.listAll().then((vaults)=>{
    for(let v of vaults){
      if(v.name == name && v.size! > 0){
        return v.id
      }
      console.log("vault id size name status",v.id,v.size,v.name,v.status)
      console.log('vault name:',v.name, ' to match ', name);
    }
  })
}

async function queryVaultIdByName(vaultId : string,name : string){
  return tusky.file.list({vaultId: vaultId, status : 'active'}).then((files)=>{
    for(let f of files.items){
      if(f.name == name){
        return f.id
      }
      console.log('file name:',f.name, ' to match ', name);
    }
  })

}

async function testUrl(){

  let vault_id = await queryVaultByName('image');
  let file_id = await queryVaultIdByName(vault_id!,'zhang5.jpg');
  const url = getUrl(vault_id!,file_id!)
  console.log(url);
 
}


// test().then( ()=>
//   queryFiles()
// )

async function tests(){
  //tusky.auth.signIn();
  //await test_upload_download();
  await queryFiles();
}

async function uploadTo(vault_id : string, parentId : string | undefined ,filePath :string){
  const fileStats = fs.statSync(filePath);
  const fileSize = fileStats.size;
  const fileName = filePath.split('/').pop()!;
  const  ext = fileName.split('.').pop() || 'bin'
  const mimetype = getMimeTypeByContentType(getContentTypeByExtType(ext))
  const fileStream = fs.createReadStream(filePath);

  console.log('upload file id =',vault_id)
  return tusky.file.upload(vault_id!,fileStream,{name:'abc',mimeType: mimetype,parentId}).then((fileId)=>{
    console.log('fileId : ',fileId)
    return fileId;
  })
}
async function test_upload_to(){
  const vaultId = getVaultId('image');
  const fileId = getFile

}



import { getLocalSigner } from '../utils/tests/local_key';
async function addProfile(addr : string){
  
  let vault = await tusky.vault.create(addr , {encrypted : false})
  return vault;

  console.log('profile id , name',vault.id, vault.name);
}

async function addOrCreateProfile(owner:string){
  let vault = tusky.file.list({vaultId: owner})
}
async function test_addOrCreate(){
   const addr = getLocalSigner().getPublicKey().toBase64();
  
}



async function  getFile(){
 
  let vaultId = await tusky.vault.listAll().then((vaults)=>{
    for(let v of vaults){
      if(v.name == 'image'){
        console.log('folders ', v.folders);
        return v.id;  
      }
    }
  })
  if(!vaultId) return;
 
   await tusky.vault.list({vaultId,status:'active'}).then((result)=>{
    for(let data of result.items){
       console.log('getFile file info: id name status files folders size' ,
            data.id, data.name, data.status ,data.files, data.folders,data.size)
    }
  });
}
//tests();

//testUrl();

getFile()







