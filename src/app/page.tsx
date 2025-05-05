'use client'
import Image from "next/image";
import Link from 'next/link';
import { useCurrentAccount } from '@mysten/dapp-kit'

type NameUrl = {
  name : string,
  url : string,
}
export default function Home() {
  const account = useCurrentAccount();
  if(!account ){
    return <div>Connected fist </div>
  }
  const fileUrls :NameUrl[] = [
    {name:'1. create profile and recharge', url:'/profile'},
    {name:'2. recharge', url:'/profile?recharge=open'},
    {name:'3. upload a image', url:'/upload'},
    {name:'4. my images', url:`/images_by/${account.address}`},
    {name:'5. recent images', url:'/image_list'},
  ];
  return (
    <div className="  font-[family-name:var(--font-geist-sans)]">
      {
        fileUrls.map((value)=>{
          return <Link href={value.url}  key={value.name}
                  className="text-blue-900 underline hover:no-underline visited:text-blue-300 ">
            <h3 className="text-2xl mx-2 px-3 pt-3">{value.name}</h3></Link>
        })
      }
      </div>
  );
}
