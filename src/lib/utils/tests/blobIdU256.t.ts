import { blobId_to_u256,u256_to_blobId } from "@/lib/utils/convert";
// 假设这是你的字符串
let str = 'tuGCqX_5qU-lhyts50TMagm9ZuHkmUVgLEhJHWBf0FE';
let v = blobId_to_u256(str); 
console.log( `${str} =>${v}`)

let str2 = u256_to_blobId(v);
console.log(`${v}=>${str2}`)
console.log(str === str2);
console.log(str)
console.log(str2)
