import { bcs } from "@mysten/sui/bcs";
import { fromHex, toHex, toBase64 } from "@mysten/sui/utils";
import { base64UrlSafeEncode } from "./convert";
import { BcsReader } from "@mysten/bcs";
import { suiClient } from "@/contracts";

export const Vector_Address = bcs.vector(bcs.Address);

export const Address = bcs.bytes(32).transform({
    input: (id: string) => fromHex(id),
    output: (id) => toHex(id),
});

// Blob IDs & hashes are represented on chain as u256, but serialized in URLs as URL-safe Base64.
const BLOB_ID = bcs.u256().transform({
    input: (id: string) => id,
    output: (id) => base64UrlSafeEncode(bcs.u256().serialize(id).toBytes()),
});

//===============================event type=======================
export type ProfileCreated = {
    profile_address : string,
    sender : string,
};

type FileBlob ={
    file_id : string,
    blob_id : string,
    start : string,
    end : number,
    mime_type : number,
}

export type FileBlobAddResult = {
    fbo_ids : string[],
    blobs : FileBlob[],
    count : number,
    sender : number;
}
/**
 * 
public struct FileBlobCreated has copy,drop{
    file_blob : FileBlob,
    sender : address
}
*/



export const ID = bcs.struct('ID',{
    bytes : Address,
})
export const UID = bcs.struct('UID',{
    id : ID
})


/**
public struct FileBlob has store,copy,drop{
    file_id : u256,
    blob_id : u256,
    start : u32,
    end : u32,
    mime_type : u8,
}
 */

export const FileBlob = bcs.struct('FileBlob',{
    file_id : bcs.u256(),
    blob_id : bcs.u256(),
    start : bcs.u32(),
    end : bcs.u32(),
    mime_type : bcs.u8(),
})

/** 
public struct  FileBlobObject has key{
    id: UID,
    file_blob : FileBlob
} */

export const FileBlobObject = bcs.struct('FileBlobObject',{
    id: UID,
    file_blob : FileBlob
})

/*
public struct BlobInfo has store,copy,drop{
    blob_id : u256,
    start: u32,
    end : u32
}
 */
// const BlobInfo = bcs.struct('BlobInfo',{
//     blob_id : bcs.u256(),
//     start : bcs.u32(),
//     end : bcs.u32()
// }) 

/**
 * 
public struct Profile has key ,store{
    id : UID,
    owner : address,
    balance : Balance<SUI>,
    file_ids : vector<u256>,
}
 */

export const  Balance = bcs.struct('Balance',{
    value : bcs.u64(),
})
export const Profile = bcs.struct('Profile',
{
    id : UID,
    owner : Address,
    balance : Balance,
    file_ids : bcs.vector(bcs.u256())
});



