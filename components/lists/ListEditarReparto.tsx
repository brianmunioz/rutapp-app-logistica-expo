import React, {  useContext, useEffect, useState } from 'react'
import { View, ScrollView } from "react-native";
import { ActivityIndicator, Button, Card, Dialog, Icon, IconButton, Portal, Searchbar, Text } from 'react-native-paper';
import IRepartosSQL from '@/interfaces/IRepartosSQL';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EditarReparto from '../Acciones/EditarReparto';
import RutappContext from '@/context/RutappContext';
import { RepartosArrType } from '@/context/types/RepartosArrType';
import { MapCenterPosType } from '@/context/types/LocationType';
import { EditarType } from '@/context/types/EditarType';
import { AccionUsuarioType } from '@/context/types/AccionUsuarioType';
import IcontactosSQL from '@/interfaces/IContactosSQL';
import { useSQLiteContext } from 'expo-sqlite';
import { usePedirRepartos } from '@/hooks/pedirRepartos';
import { usePedircontactos } from '@/hooks/pedirContactos';
import { MensajeSnackType } from '@/context/types/MensajeSnack';

interface IProps {
  datos: IRepartosSQL[],
  eliminar:(e:string)=>void,
  verUbicacion: (lat:number,lng:number)=>void,
  pedirContactos: ()=>void
}

const ListEditarReparto: React.FC= () => {
  const {repartosArr} = useContext(RutappContext) as RepartosArrType;
  const {setMapCenterPos} = useContext(RutappContext) as MapCenterPosType;
  const {setEditar} = useContext(RutappContext) as EditarType;
  const {setMensajeSnack} = useContext(RutappContext) as MensajeSnackType;

  const {setAccionUsuario} = useContext(RutappContext) as AccionUsuarioType;
  const [eliminarModal, setEliminarModal] = useState({ bool: false, id: "", nombre: "" });
  const [eliminando, setEliminando] = useState(false);
  const [eliminado, setEliminado] = useState(false);
  const [editarContacto, setEditarContacto] = useState({bool:false, index:0})
  const [modoHistorial, setModoHistorial] = useState(false);
  const [modalHistorial, setModalHistorial] = useState({bool: false,finish:false,message:""});

  const [historial, setHistorial] = useState<IRepartosSQL[]>([]);

  const [contactos, setContactos] = useState(repartosArr)
  const pedirRepartos = usePedirRepartos();
  const pedirContactos = usePedircontactos();
  const db = useSQLiteContext();

  useEffect(()=>{
    async function cambiarOrdenDeIndices(){
      const nuevosIndices = contactos.map(e=>e.id);
      await AsyncStorage.setItem('ordenrepartos',JSON.stringify(nuevosIndices)) 
      pedirRepartos();
      const historialSQL: IRepartosSQL[] = await db.getAllAsync("SELECT * FROM repartos WHERE finalizado=1");
      setHistorial(historialSQL);

    }
    cambiarOrdenDeIndices();
  },[contactos])
  const eliminar = async (e: string) => {
    await db.runAsync('DELETE FROM repartos WHERE id = $id', { $id: e }); // Binding named parameters from object
    const idsAsync = await AsyncStorage.getItem('ordenrepartos');
    let ids: number[] = idsAsync && idsAsync !== null ? JSON.parse(idsAsync) : [];
    const nuevosIds = repartosArr.length > 1 ? ids.filter(z => z != parseInt(e)):[]; 
    await AsyncStorage.setItem('ordenrepartos', JSON.stringify(nuevosIds));
    pedirRepartos();
  }
 const verUbicacion=(e:IcontactosSQL)=>{
    setAccionUsuario(null)
setEditar(false);

    setMapCenterPos({lat: e.lat, lng: e.lng});


  }
  useEffect(()=>{
    setContactos(repartosArr)
  },[editarContacto.bool])
  if (!editarContacto.bool){
  return (
    <ScrollView style={{ width: "100%", flex: 1, paddingHorizontal: 10, paddingTop: 10, backgroundColor: "white" }}>

      <View style={{ flexDirection: "column", gap: 10, paddingBottom:20,justifyContent: "center", alignItems: "center", width: "100%" }} >
        <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%"}}>
        <Text style={{fontWeight: "bold",letterSpacing: 1, textTransform:"uppercase"}}>{modoHistorial ?"Historial" :"Repartos a realizar"}</Text>

       <Button mode='elevated' 
       style={{
        alignSelf: "flex-start", 
        backgroundColor: "#FFFCF0", 
        borderWidth: 1, 
        borderColor: "black"
      }}
      onPress={()=>setModoHistorial(!modoHistorial)} 
       icon={!modoHistorial ? "history" : "truck-fast-outline"}>
        {!modoHistorial ? "Ver historial" : "Ver repartos"}
       </Button>
       </View>
       { modoHistorial && historial.length >0&& <Button mode="elevated"textColor='#dc3545' style={{borderWidth: 1, borderColor: "#dc3545", backgroundColor:"#F7E9E9"}} 
       onPress={async()=>{
        setModalHistorial({bool:true,finish: false,message:""});
        const resultado = await db.runAsync('DELETE FROM repartos WHERE finalizado = 1');
        if(resultado && resultado.changes > 0){
          setModalHistorial({bool:true,finish: true, message: "Historial eliminado con éxito"});
          setHistorial([]);

        }else{
          setModalHistorial({bool:true,finish: true, message: "Historial No se pudo eliminar"});
        }
       }}> Eliminar historial</Button>}

        {(contactos.length >0 && !modoHistorial)&&
          contactos.map((e,index) => <Card key={e.id} style={{ width: "100%",borderWidth: 1, borderColor: "black", backgroundColor: "#FFFCF0" }}>
            <Card.Title
              title={e.nombre}
              subtitle={e.direccion}
              left={(props) => <Icon {...props} color={e.tipo_contacto == "proveedor" ? "red" : "green"} source="map-marker" />}
              right={(props) => <IconButton {...props} icon="delete" onPress={() => setEliminarModal({ bool: !eliminarModal.bool, id: e.id.toString(), nombre: e.nombre })} />}
            />
             <Card.Content>
      <Text variant="bodyMedium">{e.descripcion ?e.descripcion :'Sin descripción de reparto'}</Text>
    </Card.Content>
            <Card.Actions>
            <Button mode="outlined" disabled={index == 0 ? true : false}    onPress={() =>{
             const swapWithNext = async (index: number) => {
              setContactos(arr => {
                  // Verifica que el índice está en rango y que no es el último elemento
                  if (index < 0 ) return arr;
          
                  const newArr = [...arr];
                  [newArr[index], newArr[index - 1]] = [newArr[index - 1], newArr[index]];
                  return newArr;
              });
              
          };
          swapWithNext(index);

            }}><Icon   source={'chevron-up'} size={20}></Icon> </Button>
            <Button mode="outlined"  disabled={index == (repartosArr.length-1)? true : false}   onPress={() =>  {
               const swapWithNext = (index: number) => {
                setContactos(arr => {
                    if (index < 0 || index >= arr.length - 1) return arr;
            
                    const newArr = [...arr];
                    [newArr[index], newArr[index + 1]] = [newArr[index + 1], newArr[index]];
            
                    return newArr;
                });
                
            };
            swapWithNext(index);
  
            }}> <Icon  source={'chevron-down'} size={20}></Icon> </Button>
              <Button mode='outlined' onPress={() => verUbicacion(e)}>
                <Icon  source="eye" size={20} />
              </Button>
              <Button mode='outlined' onPress={()=>setEditarContacto({bool:true, index: index})}>
                <Icon  source="pencil" size={20}  />
              </Button>
            </Card.Actions>
          </Card>
          )
}
{(historial.length >0 && modoHistorial)&&
          historial.map((e,index) => <Card key={e.id} style={{ width: "100%",borderWidth: 1, borderColor: "black", backgroundColor: "#FFFCF0" }}>
            <Card.Title
              title={e.nombre}
              subtitle={e.direccion}
              left={(props) => <Icon {...props} color={e.tipo_contacto == "proveedor" ? "red" : "green"} source="map-marker" />}
              right={(props) => <IconButton {...props} icon="delete" onPress={() => setEliminarModal({ bool: !eliminarModal.bool, id: e.id.toString(), nombre: e.nombre })} />}
            />
             <Card.Content>
      <Text variant="bodyMedium">{e.descripcion ?e.descripcion :'Sin descripción de reparto'}</Text>
      <Text variant="bodyMedium">{e.fecha.toString()}</Text>

    </Card.Content>
            <Card.Actions>
            <Button mode="outlined"     onPress={async() =>{

                    const fecha = new Date().toISOString().slice(0, 19).replace('T', ' '); // Formato YYYY-MM-DD HH:MM:SS      //agregar 3 campos mas para que funcione
      const response = 
      await db.runAsync('INSERT INTO repartos (nombre,direccion,telefono,tipo_contacto,descripcion,lat,lng,IDContacto,fecha,finalizado) VALUES (?,?,?,?,?,?,?,?,?,?)',
         e.nombre, e.direccion, e.telefono, e.tipo_contacto, 
         e.descripcion, e.lat, e.lng, 
         null, 
         fecha, 
         false);

      if (response && response?.lastInsertRowId) {
              setMensajeSnack({bool: true, texto:"Se a creado un nuevo reparto!"});
      }else{
        setMensajeSnack({bool: true, texto:"No se pudo crear el reparto"});

      }
            }}>Repetir reparto </Button>
           
              
             
            </Card.Actions>
          </Card>
          )
}
{contactos.length < 1 && !modoHistorial && <Text style={{fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1}}>No hay repartos</Text>}
{historial.length < 1 && modoHistorial && <Text style={{fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1}}>No hay historial</Text>}
      </View>
      <Portal>
              <Dialog style={{borderWidth: 1, borderColor: "black", backgroundColor: "#FFFCF0" }}
              visible={modalHistorial.bool}
               onDismiss={() => setModalHistorial({bool:false,finish:true, message:""})}
               >
                <Dialog.Title>{!modalHistorial.finish ? "eliminando historial...": "Resultado"}</Dialog.Title>
                <Dialog.Content>
                  {!modalHistorial.finish  && <ActivityIndicator/> }
                  {modalHistorial.finish && <Text variant="bodyMedium"> 
                 {modalHistorial.message}
                    </Text>}
                </Dialog.Content>
                
              </Dialog>
            </Portal>
      <Portal>
        <Dialog style={{borderWidth: 1, borderColor: "black", backgroundColor: "#FFFCF0" }}visible={eliminarModal.bool} onDismiss={() => setEliminarModal({ ...eliminarModal, bool: !eliminarModal.bool })}>
          <Dialog.Title>{eliminando ? "Eliminando...": "Eliminar reparto"}</Dialog.Title>
          <Dialog.Content>
            {eliminando  && <ActivityIndicator/> }
            { !eliminando && !eliminado && <Text variant="bodyMedium">¿Está seguro que desea eliminar el reparto nro. {eliminarModal.id}? </Text>}
            {eliminado && <Text variant="bodyMedium"> {eliminarModal.nombre} se eliminó de tus registros de repartos </Text>}
          </Dialog.Content>
          <Dialog.Actions>
            {!eliminando && 
            <Button textColor='black' onPress={() => {
              setEliminado(false);
              setEliminarModal({ ...eliminarModal, bool: !eliminarModal.bool })}}>{eliminado ? "OK": "cancelar"}</Button>
            }
            
            {!eliminado && !eliminando&& 
             <Button textColor='red' onPress={async()=>{
               eliminar(eliminarModal.id)
              
              setEliminando(true);

              setTimeout(()=>{
                setEliminando(false);
                setEliminado(true)
                setContactos(repartosArr.filter(e=>e.id.toString() != eliminarModal.id));
              },2000)
              }}>Eliminar</Button>
          }
           
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>

  )} else {
    return <EditarReparto pedirContactos={()=>pedirContactos()} setModalVisible={(e)=>setEditarContacto({bool:e,index:0})} datos={contactos[editarContacto.index]}/>
  }
}

export default ListEditarReparto