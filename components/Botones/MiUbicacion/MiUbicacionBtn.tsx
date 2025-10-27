import React, { useContext } from 'react'
import { Button, Icon, Text } from 'react-native-paper';
import * as Location from 'expo-location';
import RutappContext from '@/context/RutappContext';
import { ActualPosType, MapCenterPosType, OwnPositionType } from '@/context/types/LocationType';
import { FollowMyLocationType } from '@/context/types/FollowMyLocationType';
import { ZoomType } from '@/context/types/ZoomType';
import { MarkerTelType } from '@/context/types/MarkerTelType';
import { BoolLocationType } from '@/context/types/BoolLocationType';
import { View } from 'react-native';
import { useGetMyLocation } from '@/hooks/getMyLocation';
import { EditarType } from '@/context/types/EditarType';
import { ModalVisibleType } from '@/context/types/ModalVisibleType';


const MiUbicacionBtn = () => {
    const {ownPosition,setOwnPosition} = useContext(RutappContext) as OwnPositionType;
    const {setMapCenterPos} = useContext(RutappContext) as MapCenterPosType;
    const {followMyLocation,setFollowMyLocation} = useContext(RutappContext) as FollowMyLocationType;
    const {setZoom} = useContext(RutappContext) as ZoomType;
    const {setMarkerTel} = useContext(RutappContext) as MarkerTelType;
    const {setBoolLocation} = useContext(RutappContext)  as BoolLocationType;
    const {setEditar} = useContext(RutappContext) as EditarType;
    const {setModalVisible} = useContext(RutappContext) as ModalVisibleType;


    const getSingleLocationAsync = useGetMyLocation();
     const getLocationAsync = async () => {
      const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // Tiempo entre actualizaciones en milisegundos
        distanceInterval: 1, // Distancia mínima en metros para una nueva actualización
      },
      (newLocation) => {
        const { latitude, longitude } = newLocation.coords;
        setOwnPosition({
          lat: latitude,
          lng: longitude,
        });
        
    
      })
      }
     
    const miUbicacion = async()=>{
      const serviciosUbicacionActivos = await Location.hasServicesEnabledAsync();

      if (!serviciosUbicacionActivos) {
        getSingleLocationAsync().then(async e=>
          {
            if(e != null){
              setFollowMyLocation(true);
  
              setOwnPosition(e);
              setMapCenterPos(e);
              
            }
    
          }
    
          );
      }else{
        const location = await Location.getCurrentPositionAsync({});
        setMapCenterPos({lat:location.coords.latitude, lng: location.coords.longitude})
      }
     
      setModalVisible(false);
      setEditar(false);
  
        if (ownPosition) {
            setFollowMyLocation(true)
            setMarkerTel({ id: 0, show: false, tel: 0 })
            setZoom(17);            
            setBoolLocation(true);
            
          }
          
    }
  return (
    <View style={{flex: 1,backgroundColor: "#FFFCF0", borderColor: "black", borderWidth: 1}} >
    
    <Button 
    contentStyle={{ height: "100%" }} 
    buttonColor="#FFFCF0" 
    style={{ flex: 1, borderRadius: 0 }} 
    mode="contained-tonal" 
    onPress={miUbicacion} >
        <Icon 
        size={18}
         source={"crosshairs-gps"}
          color="rgb(133, 37, 37)" />
    </Button>
    <Text style={{backgroundColor: "#FFFCF0",paddingVertical: 1 ,width: "100%",fontWeight: "bold",textTransform: "uppercase",fontSize: 6, color: "black",textAlign: "center" }}>mi ubicación</Text>

    </View>
    )
}

export default MiUbicacionBtn