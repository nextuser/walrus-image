import { bcs } from "@mysten/sui/bcs";
import { fromHex, toHex, toBase64 } from "@mysten/sui/utils";
import { base64UrlSafeEncode } from "./url_safe_base64";
export const Address = bcs.bytes(32).transform({
    input: (id: string) => fromHex(id),
    output: (id) => toHex(id),
});

// Blob IDs & hashes are represented on chain as u256, but serialized in URLs as URL-safe Base64.
const BLOB_ID = bcs.u256().transform({
    input: (id: string) => id,
    output: (id) => base64UrlSafeEncode(bcs.u256().serialize(id).toBytes()),
});


export const ProfileCreated = bcs.struct('ProfileCreated',{
    profile_address : bcs.Address,
    sender : bcs.Address,
});

/**
 * public struct FileBlob has copy,drop{
    file_id : u256,
    blob_id : u256,
    start : u32,
    end : u32,
    mime_type : u8,
}

 */

export const FileBlob  = bcs.struct('FileBlob',{
    file_id : bcs.u256(),
    blob_id : bcs.u256(),
    start : bcs.u32(),
    end : bcs.u32(),
    mime_type : bcs.u8(),
});

/**
 * 
public struct FileBlobCreated has copy,drop{
    file_blob : FileBlob,
    sender : address
}
 */

export const FileBlobCreated = bcs.struct('FileBlobCreated',{
    file_blob : FileBlob,
    sender : bcs.Address,
})


export const FileBlobVector = bcs.vector(FileBlob);