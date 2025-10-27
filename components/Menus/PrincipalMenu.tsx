import RutappContext from '@/context/RutappContext';
import { AccionUsuarioType } from '@/context/types/AccionUsuarioType';
import { BoolPrincipalMenuType } from '@/context/types/BoolPrincipalMenuType';
import { TextoPrincipalType } from '@/context/types/TextoPrincipalTypes';
import { usePedircontactos } from '@/hooks/pedirContactos';
import * as React from 'react';
import {  View } from 'react-native';
import { Avatar, Button, Drawer, Modal, Portal, Text } from 'react-native-paper';

const PrincipalMenu = () => {
  const {boolPrincipalMenu, setBoolPrincipalMenu} = React.useContext(RutappContext) as BoolPrincipalMenuType;
  const {accionUsuario ,setAccionUsuario} = React.useContext(RutappContext) as AccionUsuarioType;
  const {textoPrincipal, setTextoPrincipal} = React.useContext(RutappContext) as TextoPrincipalType;
  const pedirContactos = usePedircontactos();

  const importarExportarHandle = ()=>{
    setAccionUsuario("importarexportar");
    setTextoPrincipal(" Importar/exportar csv")
    setBoolPrincipalMenu(false);
  }

  return (
    
    <Portal>
        <Modal visible={boolPrincipalMenu} onDismiss={() => setBoolPrincipalMenu(false)} 
        contentContainerStyle={{
            backgroundColor: "#FFFCF0",
            paddingTop: 25,
            paddingBottom: 30,
            paddingHorizontal: 10,
            borderTopLeftRadius: 25,
            width: "80%",
            height: "100%",
            alignSelf: "flex-end",
          }}>
          <View
          style={{height: "100%"}}>
            <View style={{flexDirection: "row", justifyContent: "flex-start", alignItems:"center", gap: 10}}>
                         <Avatar.Image source={require("@/assets/icon.png")} size={30}></Avatar.Image>

             <Text style={{justifyContent: "center" ,fontSize: 15, letterSpacing: 1.5, fontWeight: "bold", color: "black", marginVertical: 10 }}>
                Herramientas y más
             </Text>

            </View>


            
            <Drawer.Item
              label="Home"
              active={false}
              onPress={()=>{
                if(accionUsuario == "importarexportar" || accionUsuario == "devinfo") setAccionUsuario(null);
                pedirContactos();
                setBoolPrincipalMenu(false);
              }}
            />
            <Drawer.Item
              label="Importar/exportar CSV"
              active={false}
              onPress={importarExportarHandle}
            />

          
          </View>
          <Button onPress={() => setBoolPrincipalMenu(false)}>Cerrar</Button>
        </Modal>
      </Portal>
  );
};

export default PrincipalMenu;