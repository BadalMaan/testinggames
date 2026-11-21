import {supabase} from '../supabase'
export type AuthResult={ok:boolean;message:string}
const normalize=(phone:string)=>phone.trim().replace(/[^\d+]/g,'')
const validPhone=(phone:string)=>/^\+?[1-9]\d{7,14}$/.test(normalize(phone))
export async function registerWithPhone(phone:string,passcode:string,displayName:string):Promise<AuthResult>{
 if(!supabase)return {ok:false,message:'Supabase is not configured.'}
 if(!validPhone(phone))return {ok:false,message:'Enter a valid phone number with country code.'}
 if(passcode.trim().length<6)return {ok:false,message:'Passcode must be at least 6 characters.'}
 if(displayName.trim().length<2)return {ok:false,message:'Enter the student name.'}
 const {error}=await supabase.auth.signUp({phone:normalize(phone),password:passcode,options:{data:{display_name:displayName.trim()}}})
 return error?{ok:false,message:error.message}:{ok:true,message:'Account created. Enter the SMS verification code to activate it.'}
}
export async function loginWithPhone(phone:string,passcode:string):Promise<AuthResult>{
 if(!supabase)return {ok:false,message:'Supabase is not configured.'}
 const {error}=await supabase.auth.signInWithPassword({phone:normalize(phone),password:passcode})
 return error?{ok:false,message:error.message}:{ok:true,message:'Signed in successfully.'}
}
export async function sendRecoveryOtp(phone:string):Promise<AuthResult>{
 if(!supabase)return {ok:false,message:'Supabase is not configured.'}
 if(!validPhone(phone))return {ok:false,message:'Enter a valid phone number with country code.'}
 const {error}=await supabase.auth.signInWithOtp({phone:normalize(phone),options:{shouldCreateUser:false}})
 return error?{ok:false,message:error.message}:{ok:true,message:'Recovery code sent by SMS.'}
}
export async function verifySmsOtp(phone:string,token:string):Promise<AuthResult>{
 if(!supabase)return {ok:false,message:'Supabase is not configured.'}
 const {error}=await supabase.auth.verifyOtp({phone:normalize(phone),token:token.trim(),type:'sms'})
 return error?{ok:false,message:error.message}:{ok:true,message:'Phone verified successfully.'}
}
export async function updatePasscode(passcode:string):Promise<AuthResult>{
 if(!supabase)return {ok:false,message:'Supabase is not configured.'}
 if(passcode.trim().length<6)return {ok:false,message:'Passcode must be at least 6 characters.'}
 const {error}=await supabase.auth.updateUser({password:passcode})
 return error?{ok:false,message:error.message}:{ok:true,message:'Your passcode has been updated.'}
}
export async function signOut(){if(supabase)await supabase.auth.signOut()}
export async function getSession(){if(!supabase)return null;const {data}=await supabase.auth.getSession();return data.session}
