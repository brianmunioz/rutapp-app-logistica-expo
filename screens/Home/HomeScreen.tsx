import CrearContacto from '@/components/Acciones/CrearContacto';
import CrearReparto from '@/components/Acciones/CrearReparto';
import ListEditar from '@/components/lists/ListEditar';
import ListEditarReparto from '@/components/lists/ListEditarReparto';
import MenuAbajo from '@/components/Menus/MenuAbajo';
import MenuArriba from '@/components/Menus/MenuArriba';
import MyMap from '@/components/MyMap';
import TextoDeAccion from '@/components/TextoDeAccion';
import RutappContext from '@/context/RutappContext';
import { AccionUsuarioType } from '@/context/types/AccionUsuarioType';
import { ContactosArrType } from '@/context/types/ContactosArrType';
import { EditarType } from '@/context/types/EditarType';
import { FollowMyLocationType } from '@/context/types/FollowMyLocationType';
import { LocationCoordenadas, MapCenterPosType, OwnPositionType } from '@/context/types/LocationType';
import { MensajeSnackType } from '@/context/types/MensajeSnack';
import { ModalVisibleType } from '@/context/types/ModalVisibleType';
import { ModoContactoType } from "@/context/types/ModoContactoType";
import { RepartosArrType } from '@/context/types/RepartosArrType';
import { UbicacionSeleccionadaType } from '@/context/types/UbicacionSeleccionadaType';
import * as Notifications from "expo-notifications";
import { useGetMyLocation } from '@/hooks/getMyLocation';
import { usePedircontactos } from '@/hooks/pedirContactos';
import { usePedirRepartos } from '@/hooks/pedirRepartos';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, AppState, NativeEventSubscription, AppStateStatus } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImportarExportarScreen from '../ImportarExportar/ImportarExportarScreen';
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const HomeScreen = () => {
  const { mensajeSnack, setMensajeSnack } = useContext(RutappContext) as MensajeSnackType;
  const { modoContacto } = useContext(RutappContext) as ModoContactoType;
  const { accionUsuario, setAccionUsuario } = useContext(RutappContext) as AccionUsuarioType;
  const { modalVisible } = useContext(RutappContext) as ModalVisibleType;
  const db = useSQLiteContext();
  const pedirContactos = usePedircontactos();
  const pedirRepartos = usePedirRepartos();
 

  const { editar } = useContext(RutappContext) as EditarType;
  const { ubicacionSeleccionada } = useContext(RutappContext) as UbicacionSeleccionadaType;
  const { setOwnPosition} = useContext(RutappContext) as  OwnPositionType;
  const {setMapCenterPos} = useContext(RutappContext) as  MapCenterPosType;
  const {setFollowMyLocation} = useContext(RutappContext) as FollowMyLocationType;
  const {contactosArr} = useContext(RutappContext) as ContactosArrType;
  const {repartosArr} = useContext(RutappContext) as RepartosArrType;


  const initPosWithoutLocation: LocationCoordenadas = 
  modoContacto ?
   contactosArr.length > 0 ?
    { lat: contactosArr[contactosArr.length - 1].lat, lng: contactosArr[contactosArr.length - 1].lng } 
    : { lat: -35.103034508838604, lng: -59.50661499922906 }
    : repartosArr.length > 0 ?
     { lat: repartosArr[repartosArr.length - 1].lat, lng: repartosArr[repartosArr.length - 1].lng } :
      { lat: -35.103034508838604, lng: -59.50661499922906 };

      const mostrarNotificacion = async () => {
        const estaEnReparto = await AsyncStorage.getItem('repartiendo');
        if(estaEnReparto == "true"){
          await Notifications.scheduleNotificationAsync({
          content: {
            title: "Reparto en curso 🚚",
            body: "No olvides finalizar tu entrega.",
          },
          trigger: null, 
        });
        }
        
      };
  const getSingleLocationAsync = useGetMyLocation();
  useEffect(()=>{
    setMapCenterPos(initPosWithoutLocation);
    getSingleLocationAsync().then(async e=>
         {
           if(e != null){
             setOwnPosition(e);
             setMapCenterPos(e);
             setFollowMyLocation(true)
           }
   
         }
   
         );
     },[])
     async function verifyMode(){
      const lsRepartiendo = await AsyncStorage.getItem('repartiendo');
      if (modoContacto && (!lsRepartiendo || lsRepartiendo == "false")) {
        pedirContactos();
      } else {
        pedirRepartos();
      }
     }
  useEffect(() => {
   
    verifyMode();
  }, [modoContacto])

  const [appState, setAppState] = useState(AppState.currentState);
  // type AppStateStatus = "active" | "background" | "inactive";

  useEffect(() => {

    const handleAppStateChange = (nextAppState:AppStateStatus) => {
      console.log("Nuevo estado de la app:", nextAppState);
      
      setAppState(nextAppState);
      if(nextAppState==="active"){
        Notifications.dismissAllNotificationsAsync();
      }

      if (nextAppState === "background"|| nextAppState === "inactive") {
        
        mostrarNotificacion();
      }

      
    };

    const subscription:NativeEventSubscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove(); // Limpieza al desmontar
    };
  }, []);


  return (
    <SafeAreaView
      style={styles.container}>
             
        
      <View style={{ flex: 1, width: "100%", justifyContent: "center" }}>


        <TextoDeAccion />
        {
          accionUsuario == "importarexportar" ? 
          <ImportarExportarScreen/> 
          : 
          <>
            <MenuArriba />
        {editar && !modoContacto &&  <ListEditarReparto /> }
      {editar && modoContacto  && <ListEditar /> }

        {!modalVisible && !editar && appState == 'active'  && <MyMap />}

        {modoContacto && accionUsuario === "crear" && ubicacionSeleccionada && modalVisible &&
          <CrearContacto />}

        {!modoContacto && accionUsuario === "crear" && ubicacionSeleccionada && modalVisible &&
          <CrearReparto />}

        <MenuAbajo />
        <Snackbar
          icon="alert"
          visible={mensajeSnack.bool}
          onDismiss={() => setMensajeSnack({ ...mensajeSnack, bool: false })}  >
          {mensajeSnack.texto}
        </Snackbar> 
          
          </>
        }
      
      </View>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    backgroundColor:"#FFFCF0"
  },

});

export default HomeScreen