// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { fromBase64,toBase64,fromHex,toHex } from "@mysten/bcs";
function base64ToUrlSafe(base64:string) {
    // 把标准 Base64 中的 '+' 替换成 '-'
    let urlSafe = base64.replace(/\+/g, '-');
    // 把标准 Base64 中的 '/' 替换成 '_'
    urlSafe = urlSafe.replace(/\//g, '_');
    // 去掉末尾的填充字符 '='
    urlSafe = urlSafe.replace(/=/g, '');
    return base64.replaceAll("/", "_").replaceAll("+", "-").replaceAll("=", "")
}

function urlSafeToBase64(urlSafe:string) {
    // 把 URL 安全的 Base64 中的 '-' 替换成 '+'
    let base64 = urlSafe.replace(/-/g, '+');
    // 把 URL 安全的 Base64 中的 '_' 替换成 '/'
    base64 = base64.replace(/_/g, '/');
    // 补齐填充字符 '='
    while (base64.length % 4) {
        base64 += '=';
    }
    return base64;
}

/**
 * Converts the given bytes to Base 64, and then converts it to URL-safe Base 64.
 *
 * See [wikipedia](https://en.wikipedia.org/wiki/Base64#URL_applications).
 */
export function base64UrlSafeEncode(data: Uint8Array): string {
    let base64 = arrayBufferToBase64(data);
    // Use the URL-safe Base 64 encoding by removing padding and swapping characters.
    return base64.replaceAll("/", "_").replaceAll("+", "-").replaceAll("=", "");
}

function arrayBufferToBase64(bytes: Uint8Array): string {
    // Convert each byte in the array to the correct character
    const binaryString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
    // Encode the binary string to base64 using btoa
    return btoa(binaryString);
}


export function uint8ArrayToBigInt(arr: Uint8Array): bigint {
    let result = 0n;
    for (let i = 0; i < arr.length; i++) {
        // 将当前字节左移相应的位数
        result = (result << 8n) + BigInt(arr[i]);
    }
    return result;
}


export function toBi(hash :string) :bigint{
    return BigInt('0x' + hash);
}

export const hash_to_u256 = toBi;

export function u256_to_hash(id : bigint){
    return id.toString(16);
}

// function uint8ArrayToBigInt(uint8Array : Uint8Array): bigint {
//     let hex = '';
//     for (let i = 0; i < uint8Array.length; i++) {
//         const byteHex = uint8Array[i].toString(16).padStart(2, '0');
//         hex += byteHex;
//     }
//     return BigInt('0x' + hex);
// }
function bigIntToUint8Array(bigIntValue:bigint) {
    let hex = bigIntValue.toString(16);
    // 如果十六进制字符串长度为奇数，在前面补 0
    if (hex.length % 2) {
        hex = '0' + hex;
    }
    const byteLength = hex.length / 2;
    const uint8Array = new Uint8Array(byteLength);
    for (let i = 0; i < byteLength; i++) {
        const start = i * 2;
        const end = start + 2;
        uint8Array[i] = parseInt(hex.slice(start, end), 16);
    }
    return uint8Array;
}

export function blobId_to_u256(blobId : string):bigint{
    return uint8ArrayToBigInt(fromBase64(urlSafeToBase64(blobId)))
}


export function u256_to_blobId(uv:bigint) : string{
     return base64ToUrlSafe(toBase64(bigIntToUint8Array(uv)))
}