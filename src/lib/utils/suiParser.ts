import { bcs } from "@mysten/sui/bcs";
import { fromHex, toHex, toBase64 } from "@mysten/sui/utils";
import { base64UrlSafeEncode } from "./convert";
import { BcsReader,BcsType } from "@mysten/bcs";
import { ProfileCreated, } from "./suiTypes";
import { suiClient } from "@/contracts";
import { GSSP_COMPONENT_MEMBER_ERROR } from "next/dist/lib/constants";

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




/**
 * 
public struct FileBlobCreated has copy,drop{
    file_blob : FileBlob,
    sender : address
}
*/



export const ID = bcs.struct('ID',{
    bytes : bcs.Address,
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

// export const FileBlob = bcs.struct('FileBlob',{
//     file_id : bcs.u256(),
//     blob_id : bcs.u256(),
//     start : bcs.u32(),
//     end : bcs.u32(),
//     mime_type : bcs.u8(),
// })



/** 
public struct  FileBlobObject has key{
    id: UID,
    file_blob : FileBlob
} */

// export const FileBlobObject = bcs.struct('FileBlobObject',{
//     id: UID,
//     file_blob : FileBlob
// })



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
export const SUI = bcs.struct('SUI',{});

export function Balance<K>(v: K) {
    return bcs.struct("Table<${K.name}>", {
        value : bcs.u64(),
    });
}

/**
 * public struct Profile has key ,store{
    id : UID,
    owner : address,
    balance : Balance<SUI>,
    file_ids : vector<u256>,
}
 */
// export const Profile = bcs.struct('Profile',
// {
//     id : UID,
//     owner : Address,
//     balance : Balance(SUI),
//     file_ids : bcs.vector(bcs.u256())
// });



export const Profile = bcs.struct('Profile',{
    id : UID,
    owner : Address,
    balance : Balance(SUI),
    file_ids : bcs.vector(bcs.String),
    vault_id : bcs.String
});


/**
 * public struct FeeConfig has store,drop{
    contract_cost : u64,
    contract_fee : u64,
    wal_per_kb : u64,
    price_wal_to_sui_1000 : u64 // price = price_wal_to_sui_1000 /1000 
}
 */
export const FeeConfig = bcs.struct('FeeConfig',{
    contract_cost : bcs.u64(),
    contract_fee : bcs.u64(),
    wal_per_kb : bcs.u64(),
    price_wal_to_sui_1000 : bcs.u64()
});

export function Table<K, V>(K: BcsType<K>, V: BcsType<V>) {
    return bcs.struct("Table<${K.name}, ${V.name}>", {
        id : UID,
        size : bcs.u64(),
    });
}

/**
 * public struct Table<phantom K: copy + drop + store, phantom V: store> has key, store {
    /// the ID of this table
    id: UID,
    /// the number of key-value pairs in the table
    size: u64,
}
 */

export const  Storage = bcs.struct('Storgage',{
    id : UID,
    manager : Address,
    balance : Balance(SUI),
    feeConfig : FeeConfig,
    //owner => profile address
    profile_map : Table(Address,Profile),
    //file hash => FieleBlobObject id
});


export type StorageType = ReturnType<typeof Storage.parse>;
export type FeeConfigType = ReturnType<typeof FeeConfig.parse>;
// export type FileBlobType = ReturnType<typeof FileBlob.parse>;
// export type FileBlobObjectType = ReturnType<typeof FileBlobObject.parse>;




export const   FileData = bcs.struct('FileData',{
    vault_id : bcs.string(),
    file_id : bcs.string(),
    owner : Address,
    mime_type : bcs.u8(),
    size : bcs.u32()
});


export const    FileAdded  = bcs.struct('FileAdded',{
    file_data : FileData,
    cost : bcs.u64()
});


export type FileDataType = ReturnType<typeof FileData.parse>
export type FileAddedType = ReturnType<typeof FileAdded.parse>;
