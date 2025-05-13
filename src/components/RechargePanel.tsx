
import { Profile } from '@/lib/utils/suiTypes';
import {StorageType } from '@/lib/utils/suiParser'
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import {NumberInput} from '@/components/NumberInput'
import { Input } from './ui/input';
import { Button } from './ui/button';
import { getRechargeTx } from '@/lib/utils/suiUtil';
import { useState } from 'react';
import { getCost } from '@/lib/utils/suiUtil';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export   function RechargePanel(
    props:{ owner : string, min : number, max : number,onCharged :(value:number)=>void}){  
  const [recharge_amount , set_recharge_amount] = useState(props.min);
  const { mutate: signAndExecuteTransaction }  = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const rechargeToProfile = async (owner : string,amount : number) =>{
     amount = amount < props.min ? props.min : amount;
     let tx = getRechargeTx(owner,amount)
     signAndExecuteTransaction({transaction : tx},{
       onSuccess : (result)=>{
         if(!result.digest ){
          console.log("recharge transaction onSuccess",result);
          return;
         }
         suiClient.waitForTransaction({digest:result.digest,options:{showEffects:true}}).then((rsp)=>{
            if(rsp.effects?.status.status == 'success'){
              props.onCharged(amount);
              console.log("recharge  cost:",getCost(rsp.effects.gasUsed));
            }else{
              console.log('fail  Recharge rsp',rsp);
            }
         }).catch((reason) =>{
            console.error(" wait for callback transaction ,error reason",reason )
         }) 
       },
       onError : (err )=>{
          console.log("fail to recharge",err)
       },
       onSettled :(data,err)=>{
          if(err){
            console.log('rechargeBalance settle error',err);
            return;
          } else{
            console.log('rechargeBalance settle data ',data );
          }
       }

     });
  }

    const rechargeProfile = (e : any)=>{

      console.log('recharge to ',props.owner);
      rechargeToProfile(props.owner ,recharge_amount)
    }
    const percents = [0,25,50,75,100];
    return <div className='max-w-300[px] overflow-x-clip '>        
    <div><label>MAX {props.max/1e9} SUI</label></div>
    <div className='max-w-200[px] overflow-clip'>
      <NumberInput 
      name="setRechargAmount"
      stepper={0.01}
      min = {props.min / 1e9}
      decimalScale = {9}
      max = {props.max / 1e9}
      value={recharge_amount / 1e9} 
      suffix=" SUI"
      className='max-w-[200px] justify-start'
      onValueChange={(v? :number) => set_recharge_amount(Number(v? v:0) * 1e9)} 
    /></div>
    <div>
    <Input
      name="sliderBar"
      type="range" 
      min={props.min }
      max={props.max }
      style={{width:250}}
      className="px-0 w-400 overflow-clip"
      value={recharge_amount } 
      onChange={(e:any) => set_recharge_amount(Number(e.target.value))} 
    />

    </div>
  <div className="quick-buttons mx-2">
    {
      percents.map((p:number)=>{
        const m = Math.floor(p * props.max / 100);
        return <Button variant='percent' key={p} disabled={ m < props.min} 
                  onClick={() => set_recharge_amount(m)}>{p}%</Button>
      })
    }
  </div>
  <Button onClick={rechargeProfile}  disabled = { recharge_amount < props.min && recharge_amount > 0}
    className='bg-blue-300 hover:bg-blue-400 text-gray-800 font-bold py-1 px-2 rounded-2xl mx-2'
    >
    Recharge 
  </Button>

  </div>

}