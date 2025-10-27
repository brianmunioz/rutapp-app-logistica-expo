import RutappContext from '@/context/RutappContext'
import { DataMarkersType } from '@/context/types/DataMarkersType'
import { MapCenterPosType, OwnPositionType } from '@/context/types/LocationType'
import { FollowMyLocationType } from '@/context/types/FollowMyLocationType'
import { ZoomType } from '@/context/types/ZoomType'
import React, { useContext } from 'react'
import { View } from 'react-native'
import { Button, Icon, Text } from 'react-native-paper'

const UbicacionARepartirBtn = () => {
  const {setMapCenterPos} = useContext(RutappContext) as MapCenterPosType;
  const {zoom,setZoom} = useContext(RutappContext) as ZoomType;
  const {dataMarkers} = useContext(RutappContext) as DataMarkersType;
  const {setFollowMyLocation} = useContext(RutappContext) as FollowMyLocationType;


    const irAUbicacion = ()=>{
      //es necesario followmylocation para que pueda renderizar el zoom y enviarte a la ubicacion esperada
      if(zoom == 18){
        setZoom(17);
        console.log("El zoom es de: "+zoom )
      }
      setFollowMyLocation(false);
       if(dataMarkers.length > 0) {
        
        setFollowMyLocation(true)
        
       
        setMapCenterPos(dataMarkers[0].position)

      }    
    }
  return (
            <View style={{flex: 1,backgroundColor: "#FFFCF0", borderColor: "black", borderWidth: 1}} >
    
    <Button contentStyle={{ height: "100%", flexDirection: "column" }} buttonColor="#FFFCF0" style={{ flex: 1, borderRadius: 0 }} mode="contained-tonal"
    onPress={irAUbicacion}><Icon size={19} source={"map-marker"} color="black" /></Button>
          <Text style={{backgroundColor: "#FFFCF0",paddingVertical: 1 ,width: "100%",fontWeight: "bold",textTransform: "uppercase",fontSize: 6, color: "black",textAlign: "center" }}>ubicación cliente</Text>

    </View>



  )
}

export default UbicacionARepartirBtn