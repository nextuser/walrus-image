
/// Module: file_blob
module file_blob::file_blob;
use sui::table::{Self,Table};
use sui::event::emit;
use sui::sui::SUI;
use sui::balance::{Self,Balance};
use sui::coin::Coin;

const CONTRACT_WALRUS_FEE : u64 = 2_400_000;
const CONTRACT_IMAGE_FEE : u64 = 3_000_000;
const WALRUS_KB_FEE  : u64 = 150_000;


//==========================data struct=================================
// public struct FileInfo has store,copy,drop{
//     file_id : u256,//file hash
//     mime_type : u8,//mapping to mimetype
//     size : u32
// }

public struct FileBlob has store,copy,drop{
    file_id : u256,
    blob_id : u256,
    start : u32,
    end : u32,
    mime_type : u8,
}

public struct  FileBlobObject has key{
    id: UID,
    file_blob : FileBlob
} 

public struct FileAdded has copy,drop{
    file_hash : u256,
    owner : address,
    size : u32,
    cost : u64,

}
/**
保证每个用户一个profile，方便遍历所有profile
*/

public struct FeeConfig has store,drop{
    contract_walrus_fee : u64,
    contract_image_fee : u64,
    walrus_kb_fee : u64
}


public struct Storage has key,store{
    id : UID,
    manager : address,
    balance : Balance<SUI>,
    feeConfig : FeeConfig,
    //owner => profile address
    profile_map : Table<address,Profile>,
    //file hash => FieleBlobObject id
    file_blob_map : Table<u256,address>
}


/**
每个用户的file => blob地址
*/
public struct Profile has key ,store{
    id : UID,
    owner : address,
    balance : Balance<SUI>,
    file_ids : vector<u256>,
}

//=================events ====================
public struct ProfileCreated has copy,drop{
    profile_address : address,
    sender : address
}

public struct FileBlobAddResult has copy,drop{
    fbo_ids : vector<address>,
    blobs : vector<FileBlob>,
    count : u64,
    sender : address
}


// public struct FileMismatch has copy,drop{
//     file_id : u256,
//     mime_type : u8,
//     old_mime_type : u8,
//     size : u32,
//     old_size : u32,
// }

public struct StroageCreated has copy ,drop{
    storage : address,
}

//error consts

const ERR_PROFILE_CREATED :u64 = 3;
//const ERR_PROFILE_SHOULD_CONTAINS_FILE_ID : u64 = 4;  
const ERROR_ADD_BLOB_ARG_PARAM_INVALID : u64 = 5; 
const ERROR_ADD_FILE_SENDER_SHOULD_BE_MANAGER : u64 = 6;
const ERROR_ADD_BLOB_SENDER_SHOULD_BE_MANAGER : u64 = 7; 
const ERROR_WITDRAW_SENDER_SHOULD_BE_MANAGER : u64 = 8; 
//===========================================functions ===========================================

fun init(ctx : &mut TxContext){
    create_storage(ctx);
}


fun create_storage(ctx : &mut TxContext){
    let storage = Storage{
        id : object::new(ctx),
        manager : ctx.sender(),
        feeConfig: FeeConfig{
            contract_walrus_fee : CONTRACT_WALRUS_FEE,
            contract_image_fee : CONTRACT_IMAGE_FEE,
            walrus_kb_fee : WALRUS_KB_FEE
        },
        balance : balance::zero(),
        file_blob_map : table::new<u256,address>(ctx),
        profile_map : table::new<address,Profile>(ctx),
    };

    emit(StroageCreated{ 
            storage: object::id(&storage).to_address()}
        );

    transfer::share_object(storage);
}


entry fun withdraw(storage : &mut Storage, ctx : &mut TxContext){
    assert!(ctx.sender() == storage.manager,ERROR_WITDRAW_SENDER_SHOULD_BE_MANAGER);
    let amount = storage.balance.value();
    let coin = storage.balance.split(amount).into_coin(ctx);
    transfer::public_transfer(coin,ctx.sender());
}

public fun calcuate_fee(  config : &FeeConfig, size : u64) : u64{
    let kbs = size >> 10;
    config.contract_image_fee + config.contract_walrus_fee  + kbs * config.walrus_kb_fee
}

public fun recharge(profile : &mut Profile, coin : Coin<SUI>) : u64{
    profile.balance.join(coin.into_balance());
    profile.balance.value()
}


public fun get_file_blobs(storage : &Storage,owner : address) : vector<address>{
    let profile = storage.profile_map.borrow(owner);
    let len = profile.file_ids.length();
    let mut fb_ids :vector<address> = vector::empty();
    len.do!(|index| {
        let file_id = profile.file_ids[index];
        if(storage.file_blob_map.contains(file_id)){
            let blob_addr = storage.file_blob_map.borrow(file_id);
            fb_ids.push_back(*blob_addr);
        }//end if
    } );
    fb_ids
}

entry fun try_get_profile(storage:&Storage,sender : address) : Option<address>{
    if(storage.profile_map.contains(sender) ){
        let profile = storage.profile_map.borrow(sender);
        option::some(profile.id.to_address() )
    } else{
        option::none()
    }
}





entry fun create_profile(storage : &mut Storage,coin : Coin<SUI>,ctx :&mut TxContext){
    let sender = ctx.sender();
    assert!(!storage.profile_map.contains(sender),ERR_PROFILE_CREATED);
    let profile = Profile{
        id: object::new(ctx),
        balance : coin.into_balance(),
        owner : sender,
        file_ids : vector::empty<u256>(),
    };
    let profile_addr = profile.id.to_address();
    storage.profile_map.add(sender,profile);

    emit(ProfileCreated{
        profile_address : profile_addr,
        sender : ctx.sender()
    });

}

entry fun add_file(storage : &mut Storage,
                    owner : address,
                    file_id :u256,
                    size : u32,
                    ctx : & TxContext){
    assert!(storage.manager == ctx.sender(),ERROR_ADD_FILE_SENDER_SHOULD_BE_MANAGER);
    let  profile : &mut Profile = storage.profile_map.borrow_mut(owner);
    profile.file_ids.push_back(file_id);
    let fee = calcuate_fee(&storage.feeConfig,size as u64 );
    storage.balance.join(profile.balance.split(fee));
    emit(FileAdded{
        file_hash : file_id,
        owner ,
        size ,
        cost : fee,
    });
}

entry fun add_file_blob(
            storage : &mut Storage,
            blob_id: u256,
            file_ids : vector<u256>,
            mime_types : vector<u8>,
            starts : vector<u32>,
            ends : vector<u32>,
            ctx : &mut TxContext)
{
    assert!(storage.manager == ctx.sender(),ERROR_ADD_BLOB_SENDER_SHOULD_BE_MANAGER);
    let count = file_ids.length();
    
    assert!(count == mime_types.length() 
            && starts.length() == ends.length() 
            && starts.length() == count ,ERROR_ADD_BLOB_ARG_PARAM_INVALID);
    let  mut blobs = vector::empty<FileBlob>();
    let mut fbo_ids = vector::empty<address>();  
    count.do!(|i|{

        let file_id = file_ids[i];
        if(storage.file_blob_map.contains(file_id)){
            return
        };
        
        let fbo_id = object::new(ctx);
        let fbo_address = fbo_id.to_address();
        
        let blob_info = FileBlobObject{
            id : fbo_id,
            file_blob : FileBlob{
                file_id ,
                blob_id,
                start :  starts[i],
                end : ends[i],
                mime_type : mime_types[i]
            }
        };
        let fb_copy = blob_info.file_blob;
        blobs.push_back(fb_copy);
        fbo_ids.push_back(fbo_address);
        //take fee from Profile => Storage

        storage.file_blob_map.add(file_id,fbo_address);
        transfer::transfer(blob_info, storage.id.to_address())
    });

    emit(FileBlobAddResult{
                fbo_ids,
                blobs,
                count : fbo_ids.length(),
                sender : ctx.sender()
    });

    
}
