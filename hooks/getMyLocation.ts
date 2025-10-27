import  { useContext } from 'react'
import * as Location from 'expo-location';
import RutappContext from '@/context/RutappContext';
import { OwnPositionType } from '@/context/types/LocationType';
import { MensajeSnackType } from '@/context/types/MensajeSnack';



export function useGetMyLocation  ()  {
    const {setOwnPosition} = useContext(RutappContext) as OwnPositionType;
    const {setMensajeSnack} = useContext(RutappContext) as MensajeSnackType;
  return       async function getSingleLocationAsync () {
          try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
              setMensajeSnack({bool:true,texto: "ACCESO DENEGADO: Para que la app funcione correctamente es necesario que tenga la ubicación activada"});

              return null; 
            }
        
            // Obtén la ubicación actual solo una vez
            const { coords } = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.High,
            });
            await Location.watchPositionAsync(
                {
                  accuracy: Location.Accuracy.High,
                  timeInterval: 5000, // Tiempo entre actualizaciones
                  distanceInterval: 1, // Distancia en metros cada que actualiza :P
                },
                (newLocation) => {
                  const { latitude, longitude } = newLocation.coords;
                  setOwnPosition({
                    lat: latitude,
                    lng: longitude,
                  });
                  
              
                })
            return {
              lat: coords.latitude,
              lng: coords.longitude,
            };
          } catch (error) {
            setMensajeSnack({bool:true,texto: "Para que la app funcione correctamente es necesario que tenga la ubicación activada"});
            return null;
          }
        };
}