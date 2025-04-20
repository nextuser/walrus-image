
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
/**
保证每个用户一个profile，方便遍历所有profile
*/
public struct Storage has key,store{
    id : UID,
    profile_map : Table<address,address>,
}

public struct Profile has key ,store{
    id : UID,
    file_ids : vector<u256>,
    file_info_map : LoopableMap<u256,FileInfo>,
    file_blobs : Table<u256 ,BlobInfo> ,
}

//=================events ====================
public struct ProfileCreated has copy,drop{
    profile_address : address,
    sender : address
}

public struct FileAdded has copy,drop {
    file_id : u256,
    mime_type : u8,
    size : u32,
    owner : address
}


public struct FileBlob has copy,drop{
    file_id : u256,
    blob_id : u256,
    start : u32,
    end : u32,
    mime_type : u8,
}


public struct FileBlobCreated has copy,drop{
    file_blob : FileBlob,
    sender : address
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
        profile_map : table::new<address,address>(ctx),
    };

    emit(StroageCreated{ 
            storage: object::id(&storage).to_address()}
        );

    transfer::share_object(storage);
}

public fun get_file_blob(profile : &Profile) : vector<FileBlob>{
    let len = profile.file_ids.length();
    let mut v : vector<FileBlob> = vector::empty();
    len.do!(|index| {
        let file_id = *profile.file_ids.borrow(index);
        let fi = profile.file_info_map.borrow(file_id);
        let blob = profile.file_blobs.borrow(file_id);
        let fbi = FileBlob {
            file_id : file_id,
            blob_id : blob.blob_id,
            start : blob.offset,
            end : blob.offset + fi.size,
            mime_type : fi.mime_type 
        };

        v.push_back(fbi);
    } );
    
    v
}

const ERR_PROFILE_CREATED :u64 = 3;
entry fun create_profile(storage : &mut Storage,ctx :&mut TxContext){
    let sender = ctx.sender();
    assert!(!storage.profile_map.contains(sender),ERR_PROFILE_CREATED);
    let profile = Profile{
        id: object::new(ctx),
        file_ids : vector::empty(),
        file_info_map: loopable_map::new(ctx),
        file_blobs : table::new<u256 ,BlobInfo>(ctx) ,
    };
    
    storage.profile_map.add(sender,profile.id.to_address());

    emit(ProfileCreated{
        profile_address : profile.id.to_address(),
        sender : ctx.sender()
    });

    transfer::transfer(profile,sender);
}


const ADD_FILE_ERROR_NOT_FOUND_INFO : u64 = 0;
const ADD_FILE_ERROR_INFO_MISMATCH : u64 = 1;
const ADD_FILE_ERROR_NEW_PROFILE_NO_INFO : u64 = 1;

const ADD_FILE_SUCC_ADD_NEW:u64 = 100;
const ADD_FILE_SUCC_ADD_BEFORE:u64 = 101;

public fun add_file(profile : &mut Profile,
                file_id:u256,
                mime_type: u8,
                size:u32,
                ctx : &mut TxContext) : u64
{

    if(profile.file_ids.contains(&file_id)){
        if(profile.file_info_map.contains(file_id)){
            let fileInfo = profile.file_info_map.borrow(file_id);
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
    
    if(loopable_map::contains(&profile.file_info_map,file_id)){
        abort ADD_FILE_ERROR_NEW_PROFILE_NO_INFO
    };

    let fi = FileInfo {
        file_id,
        mime_type,
        size
    } ;

    loopable_map::add(&mut profile.file_info_map,file_id,fi);
    // 新增了文件才需要加blob
    emit(FileAdded{
        file_id,
        mime_type,
        size,
        owner : ctx.sender()
    });
    ADD_FILE_SUCC_ADD_NEW
}

public fun is_blob_uploaded(profile : &Profile,file_id : u256) : bool{
    profile.file_blobs.contains(file_id)
}

const ERROR_ADD_BLOB_SHOULD_AFTER_ADD_FILE : u64 = 2;
entry fun add_blob(profile :&mut Profile,
                file_id : u256,
                blob_id: u256,
                offset : u32,
                ctx : & TxContext)
{
    assert!(profile.file_info_map.contains(file_id),ERROR_ADD_BLOB_SHOULD_AFTER_ADD_FILE);
    let file_info = profile.file_info_map.borrow(file_id);
    //file reused
    if(profile.file_blobs.contains(file_id)){
        return
    };


    let blob_info = BlobInfo{
        blob_id,
        offset
    };
    table::add(&mut profile.file_blobs, file_id,blob_info);
    emit(FileBlobCreated{
            file_blob:FileBlob{file_id,
            blob_id ,
            mime_type:file_info.mime_type ,
            start : offset ,
            end : offset + file_info.size 
            },
            sender : ctx.sender()
    })
}
