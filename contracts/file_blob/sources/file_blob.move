
/// Module: file_blob
module file_blob::file_blob;
use sui::table::{Self,Table};
use file_blob::loopable_map::{Self,LoopableMap};
use sui::event::emit;

//==========================data struct=================================
public struct FileInfo has store{
    file_id : u256,//file hash
    mime_type : u8,//mapping to mimetype
    size : u32
}
public struct BlobInfo has store{
    blob_id : u256,
    offset: u32,
}
public struct Storage has key,store{
    id : UID,
    file_info_map : LoopableMap<u256,FileInfo>,
    file_blobs : Table<u256 ,BlobInfo> 
}

public struct Profile has key ,store{
    id : UID,
    file_ids : vector<u256>
}

//=================events ====================
public struct ProfileCreated has copy,drop{
    profile_address : address,
    sender : address
}

public struct FileBlobCreated has copy,drop{
    file_id : u256,
    mime_type : u8,
    blob_id : u256,
    offset : u32,
    size : u32,
    sender : address
}


public struct FileAdded has copy,drop {
    file_id : u256,
    mime_type : u8,
    size : u32,
    owner : address
}

public struct FileMismatch has copy,drop{
    file_id : u256,
    mime_type : u8,
    old_mime_type : u8,
    size : u32,
    old_size : u32,
}

public struct StroageCreated has copy ,drop{
    storage : address,
}

//===========================================functions ===========================================

fun init(ctx : &mut TxContext){
    create_storage(ctx);
}


fun create_storage(ctx : &mut TxContext){
    let storage = Storage{
        id : object::new(ctx),
        file_info_map: loopable_map::new(ctx),
        file_blobs : table::new<u256 ,BlobInfo>(ctx) 
    };

    emit(StroageCreated{ 
            storage: object::id(&storage).to_address()}
        );

    transfer::share_object(storage);
}

entry fun create_profile(cxt :&mut TxContext){
    let profile = Profile{
        id: object::new(cxt),
        file_ids : vector::empty()
    };
    emit(ProfileCreated{
        profile_address : profile.id.to_address(),
        sender : cxt.sender()
    });
    transfer::transfer(profile,cxt.sender());
}


const ADD_FILE_ERROR_NOT_FOUND_INFO : u64 = 0;
const ADD_FILE_ERROR_INFO_MISMATCH : u64 = 1;
const ADD_FILE_ERROR_NEW_PROFILE_NO_INFO : u64 = 1;

const ADD_FILE_SUCC_ADD_NEW:u64 = 100;
const ADD_FILE_SUCC_ADD_BEFORE:u64 = 101;

public fun add_file(storage :&mut Storage,
                profile : &mut Profile,
                file_id:u256,
                mime_type: u8,
                size:u32,
                ctx : &mut TxContext) : u64
{

    if(profile.file_ids.contains(&file_id)){
        if(storage.file_info_map.contains(file_id)){
            let fileInfo = storage.file_info_map.borrow(file_id);
            if(fileInfo.size == size && fileInfo.mime_type == mime_type){
                // the file uploaded before
                return ADD_FILE_SUCC_ADD_BEFORE
            } else{
                emit(FileMismatch {
                        file_id ,
                        mime_type ,

                        size ,
                        old_mime_type : fileInfo.mime_type,
                        old_size : fileInfo.size,
                    });
                abort ADD_FILE_ERROR_INFO_MISMATCH
            }
        }
        else{
            abort  ADD_FILE_ERROR_NOT_FOUND_INFO
        }
    };

    profile.file_ids.push_back(file_id);
    
    if(loopable_map::contains(&storage.file_info_map,file_id)){
        abort ADD_FILE_ERROR_NEW_PROFILE_NO_INFO
    };

    let fi = FileInfo {
        file_id,
        mime_type,
        size
    } ;

    loopable_map::add(&mut storage.file_info_map,file_id,fi);
    // 新增了文件才需要加blob
    emit(FileAdded{
        file_id,
        mime_type,
        size,
        owner : ctx.sender()
    });
    ADD_FILE_SUCC_ADD_NEW
}

public fun is_blob_uploaded(storage : &Storage,file_id : u256) : bool{
    return storage.file_blobs.contains(file_id)
}

const ERROR_ADD_BLOB_SHOULD_AFTER_ADD_FILE : u64 = 2;
entry fun add_blob(storage :&mut Storage,
                file_id : u256,
                blob_id: u256,
                offset : u32,
                ctx : & TxContext)
{
    assert!(storage.file_info_map.contains(file_id),ERROR_ADD_BLOB_SHOULD_AFTER_ADD_FILE);
    let fileInfo = storage.file_info_map.borrow(file_id);
    //file reused
    if(storage.file_blobs.contains(file_id)){
        return
    };


    let blob_info = BlobInfo{
        blob_id,
        offset
    };
    table::add(&mut storage.file_blobs, file_id,blob_info);
    emit(FileBlobCreated{
            file_id,
            blob_id ,
            mime_type:fileInfo.mime_type ,
            offset ,
            size:fileInfo.size ,
            sender : ctx.sender()
    })
}
