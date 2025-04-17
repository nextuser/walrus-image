/// add a tranversable list,  and typescript sdk can access dynamic field of user data
module file_blob::loopable_map;
use sui::table::{Self,Table};

public struct LoopableMap<phantom K: copy + drop + store,phantom V : store> has store{
    values : Table<K,V>,
    keys : Table<u32,K>,
    count : u32,
}

public fun size< K: copy + drop + store,V:store>(ul :& LoopableMap<K,V> ) : u32{
     ul.count
}

public fun add<K: copy + drop + store,V:store>( list : &mut LoopableMap<K,V>, addr: K,value : V){

    list.values.add(addr,value);
    list.keys.add( list.count, addr);
    list.count = list.count + 1;
}

public fun at<K: copy + drop + store,V : store>(list:&LoopableMap<K,V>,index :u32) : &V{
    assert!(index < list.count);
    let addr = list.keys.borrow(index);
    list.values.borrow(*addr)
}

public fun at_mut<K: copy + drop + store,V : store>(list:&mut LoopableMap<K,V>,index :u32) : &mut V{
    assert!(index < list.count);
    let addr = list.keys.borrow(index);
    list.values.borrow_mut(*addr)
}

public fun borrow<K: copy + drop + store,V : store>(list : & LoopableMap<K,V>, addr: K) : &V{
    list.values.borrow(addr)
}

public fun borrow_mut<K: copy + drop + store,V : store>(list : &mut LoopableMap<K,V>, addr: K) : &mut V{
    list.values.borrow_mut(addr)
}

public fun new<K: copy + drop + store,V : store>(ctx : &mut TxContext) : LoopableMap<K,V>{
    LoopableMap<K,V>{
        values: table::new<K,V>(ctx),
        keys : table::new<u32,K>(ctx),
        count : 0,
    }
}

public fun contains<K: copy + drop + store,V : store>(ul : & LoopableMap<K,V> ,key  : K) : bool {
    ul.values.contains(key)
}