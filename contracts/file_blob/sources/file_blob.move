
/// Module: file_blob
module file_blob::file_blob;
use sui::table::{Self,Table};
use sui::event::emit;
use sui::sui::SUI;
use sui::balance::{Self,Balance};
use sui::coin::Coin;
use std::ascii::String;

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
}


/**
每个用户的file => blob地址
*/
public struct Profile has key ,store{
    id : UID,
    owner : address,
    balance : Balance<SUI>,
    file_ids : vector<String>,
    vault_id : String
}

//=================events ====================
public struct ProfileCreated has copy,drop{
    profile_address : address,
    vault_id : String,
    sender : address
}

public struct FileData has copy,drop,store{
    vault_id : String,
    file_id : String,
    owner : address,
    mime_type : u8,
    size : u32,
}


public struct FileAdded has copy,drop{
    file_data : FileData,
    cost : u64,
}

// public struct FileDataObject has key,store{
//     id : UID,
//     file_data : FileData
// }


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
const ERROR_ADD_FILE_SENDER_SHOULD_BE_MANAGER : u64 = 6;
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


public fun get_file_blobs(storage : &Storage,owner : address) : vector<String>{
    let profile = storage.profile_map.borrow(owner);
    return profile.file_ids
}

entry fun try_get_profile(storage:&Storage,sender : address) : Option<address>{
    if(storage.profile_map.contains(sender) ){
        let profile = storage.profile_map.borrow(sender);
        option::some(profile.id.to_address() )
    } else{
        option::none()
    }
}


entry fun create_profile(storage : &mut Storage,
                        coin : Coin<SUI>,
                        vault_id : String,
                        ctx :&mut TxContext){
    let sender = ctx.sender();
    assert!(!storage.profile_map.contains(sender),ERR_PROFILE_CREATED);
    let profile = Profile{
        id: object::new(ctx),
        vault_id,
        balance : coin.into_balance(),
        owner : sender,
        file_ids : vector::empty<String>(),
    };
    let profile_addr = profile.id.to_address();
    storage.profile_map.add(sender,profile);

    emit(ProfileCreated{
        vault_id,
        profile_address : profile_addr,
        sender : ctx.sender()
    });

}

entry fun add_file(storage : &mut Storage,
                    owner : address,
                    file_id :String,
                    mime_type : u8,
                    size : u32,
                    ctx : &  TxContext){
    assert!(storage.manager == ctx.sender(),ERROR_ADD_FILE_SENDER_SHOULD_BE_MANAGER);
    let  profile : &mut Profile = storage.profile_map.borrow_mut(owner);

    profile.file_ids.push_back(file_id);
    let fee = calcuate_fee(&storage.feeConfig,size as u64 );
    storage.balance.join(profile.balance.split(fee));

    // let  fdo = FileDataObject{
    //     id : object::new(ctx),
    //     file_data : FileData{
    //         owner,
    //         mime_type,
    //         size,
    //         file_id,
    //         vault_id : profile.vault_id
    //     }
    // };
    // transfer::transfer(fdo, storage.id.to_address());

    emit(FileAdded{
        file_data  :   FileData{
            owner,
            mime_type,
            size,
            file_id,
            vault_id : profile.vault_id
        },   
        cost : fee,
    });
    
}


