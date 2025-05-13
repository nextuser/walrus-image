export type ID  = string;
export type Address = string;
export type u256 = string;
export type u64 = number;
export type u32 = number;
export type u16 = number;
export type u8 = number;

export type UID = {
    id: string,
}
export type Profile = {
        balance: string,
        file_ids: string[],
        vault_id:string
        id: UID,
        owner: Address,
}

export type Struct<T> = {
        type: string,
        fields: T 
}
export type  DynamicField<K,V>={
        id: UID,
        name: K,
        value: V
};




export type ProfileCreated = {
    profile_address : Address,
    sender : Address,
};

// export type FileBlob ={
//     file_id : string,
//     blob_id : string,
//     start : number,
//     end : number,
//     mime_type : number,
// }

export type FileBlobAddResult = {
    fbo_ids : string[],
    count : number,
    sender : number;
}
