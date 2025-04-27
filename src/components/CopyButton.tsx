'use client'
import { Copy } from "lucide-react";
let CopyButton =( props:{ display:string, copy_value: string,size:number,fontSize:number,className?:string})=>{
    const copyContent = async (text:string) => {
        try {
        await navigator.clipboard.writeText(text);
        console.log('Content copied to clipboard');
        } catch (err) {
        console.error('Failed to copy: ', err);
        }
    }
    return (<span className={props.className}>
        <button onClick={()=>copyContent(props.copy_value)} className="text-gray-500 hover:text-gray-700 ">
        <Copy size={props.size} className="hover:cursor-pointer" />
        <label style={{fontSize:props.fontSize }}>{props.display}</label>
        </button></span>
        )
}


export default CopyButton;