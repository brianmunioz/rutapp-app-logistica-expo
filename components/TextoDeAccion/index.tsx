import RutappContext from '@/context/RutappContext';
import { AccionUsuarioType } from '@/context/types/AccionUsuarioType';
import { BoolPrincipalMenuType } from '@/context/types/BoolPrincipalMenuType';
import { ModoContactoType } from '@/context/types/ModoContactoType';
import { TextoPrincipalType } from '@/context/types/TextoPrincipalTypes';
import React, { useContext } from 'react'
import {  View } from 'react-native'
import {  Icon, Text, TouchableRipple } from 'react-native-paper'

const TextoDeAccion = () => {
    const {modoContacto } = useContext( RutappContext) as ModoContactoType;
      const {accionUsuario}= useContext(RutappContext) as AccionUsuarioType;
      const {boolPrincipalMenu, setBoolPrincipalMenu} = useContext(RutappContext) as BoolPrincipalMenuType;
      const {textoPrincipal} = useContext(RutappContext) as TextoPrincipalType;


  return (
    <View style={{ 
      flexDirection: "row", 
      justifyContent: accionUsuario == "repartiendo" ? "center": "space-between", 
      alignItems: "center", 
      width: "100%", 
      height: 50,
      paddingHorizontal: 20,
      backgroundColor: accionUsuario == "repartiendo"?"#bd3831":"#FFFCF0"
     }}>
      

   <Text style={{  
    color: accionUsuario == "repartiendo"? "#FFFCF0":"black", 
     
    fontWeight: "bold", 
    letterSpacing:accionUsuario == "repartiendo"?1: 3, 
    justifyContent: "center", 
    alignItems: "center",
    textTransform: "uppercase",
    fontSize:  11 
      }}
    
    > 
    {
      accionUsuario!= "importarexportar"  && 
      <Icon source={modoContacto ? "account-box" : "truck-fast-outline"}  
    size={ 12 }  
    color={accionUsuario == "repartiendo"?"#FFFCF0" : "black"}>

    </Icon>  
    }
   
    {
      accionUsuario == 'importarexportar' &&
      <Icon source="database-sync" size={12}
      color='black'></Icon>
    }
    {modoContacto && accionUsuario!= "importarexportar" &&  " contactos"}
    {!modoContacto && accionUsuario != "repartiendo" && accionUsuario!= "importarexportar" && " repartos"}
    {(  accionUsuario == "repartiendo" || accionUsuario == "importarexportar") && 
      textoPrincipal
    }
   
    </Text>
    {accionUsuario != "repartiendo" &&
        <TouchableRipple  onPress={()=>{setBoolPrincipalMenu(!boolPrincipalMenu)}}><Icon source={"menu"} size={30}></Icon></TouchableRipple>

    }
    
  </View>
  )
}

export default TextoDeAccion