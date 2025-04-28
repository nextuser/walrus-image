
/// Module: file_blob
module file_blob::file_blob;
use sui::table::{Self,Table};
use sui::event::emit;
use sui::sui::SUI;
use sui::balance::{Self,Balance};
use sui::coin::Coin;

const CONTRACT_COST : u64 = 2_400_000;
const CONTRACT_FEE : u64 = 3_000_000;
const WALRUS_KB_FEE_WAL  : u64 = 150_000;
const PRICE_WAL_TO_SUI_1000 : u64 = 172;


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
    is_new : bool,
    cost : u64,
}
/**
保证每个用户一个profile，方便遍历所有profile
*/

public struct FeeConfig has store,drop{
    contract_cost : u64,
    contract_fee : u64,
    wal_per_kb : u64,
    price_wal_to_sui_1000 : u64 // price = price_wal_to_sui_1000 /1000 
}




public struct Storage has key,store{
    id : UID,
    manager : address,
    balance : Balance<SUI>,
    feeConfig : FeeConfig,
    //owner => profile address
    profile_map : Table<address,Profile>,
    //file hash => FileBlobObject id
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
            contract_cost : CONTRACT_COST,
            contract_fee : CONTRACT_FEE,
            wal_per_kb : WALRUS_KB_FEE_WAL,
            price_wal_to_sui_1000 : PRICE_WAL_TO_SUI_1000
        },
        balance : balance::zero(),
        //file_id => address of FileBlob
        file_blob_map : table::new<u256,address>(ctx),
        //owner => profile
        profile_map : table::new<address,Profile>(ctx),
    };

    emit(StroageCreated{ 
            storage: object::id(&storage).to_address()}
        );

    transfer::share_object(storage);
}

public fun updatePrice(storage : &mut Storage,walToSui : u64) {
    storage.feeConfig.price_wal_to_sui_1000 = walToSui;
}

public fun updateConfig(storage : &mut Storage, fee :u64){
    storage.feeConfig.contract_fee = fee;
}



entry fun withdraw(storage : &mut Storage, ctx : &mut TxContext){
    assert!(ctx.sender() == storage.manager,ERROR_WITDRAW_SENDER_SHOULD_BE_MANAGER);
    let amount = storage.balance.value();
    let coin = storage.balance.split(amount).into_coin(ctx);
    transfer::public_transfer(coin,ctx.sender());
}

public fun calcuate_fee(  config : &FeeConfig, size : u64) : u64{
    let kbs = size >> 10;
    let wal_cost = kbs * config.wal_per_kb * config.price_wal_to_sui_1000/1000; 
    config.contract_fee + config.contract_cost  +  wal_cost 
}

public fun recharge(storage : &mut Storage ,owner : address, coin : Coin<SUI>) : u64{
    let profile = storage.profile_map.borrow_mut(owner);
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
    if(profile.file_ids.contains(&file_id)){
        emit(FileAdded{
            file_hash : file_id,
            owner ,
            size ,
            is_new : false,
            cost : 0,
        });
        return
    };
    profile.file_ids.push_back(file_id);
    let fee = calcuate_fee(&storage.feeConfig,size as u64 );
    storage.balance.join(profile.balance.split(fee));
    emit(FileAdded{
        file_hash : file_id,
        owner ,
        size ,
        is_new : true,
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
        fbo_ids.push_back(fbo_address);
        //take fee from Profile => Storage

        storage.file_blob_map.add(file_id,fbo_address);
        transfer::transfer(blob_info, storage.id.to_address())
    });

    emit(FileBlobAddResult{
                fbo_ids,
                count : fbo_ids.length(),
                sender : ctx.sender()
    });

    
}
