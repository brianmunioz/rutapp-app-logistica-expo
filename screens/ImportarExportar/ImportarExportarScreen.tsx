import { documentDirectory, EncodingType, readAsStringAsync, writeAsStringAsync } from "expo-file-system";
import { isAvailableAsync, shareAsync } from "expo-sharing";
import React, { useContext, useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import { Button, Dialog, Portal, Text } from "react-native-paper";
import Papa from "papaparse";
import { getDocumentAsync } from "expo-document-picker";
import { useSQLiteContext } from "expo-sqlite";
import IRepartosSQL from "@/interfaces/IRepartosSQL";
import RutappContext from "@/context/RutappContext";
import { MensajeSnackType } from "@/context/types/MensajeSnack";
import IcontactosSQL from "@/interfaces/IContactosSQL";
import { usePedirRepartos } from "@/hooks/pedirRepartos";
import { usePedircontactos } from "@/hooks/pedirContactos";


const ImportarExportarScreen = () => {
      const db = useSQLiteContext();
      const [importarModal, setImportarModal] = useState({bool:false, finish: false, contacto: true,importado:false});
      const pedirRepartos = usePedirRepartos();
      const pedirContactos = usePedircontactos();

  
const{ setMensajeSnack} = useContext(RutappContext) as MensajeSnackType;
  const [fileName, setFileName] = useState("");

  const pickCsvFile = async (contactobool:boolean) => {
    try {
      const result = await getDocumentAsync({
        type: "*/*", // Solo permite CSV
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      const selectedFile = result.assets[0];

      if (!selectedFile.name.endsWith(".csv")) {
        setMensajeSnack({bool: true, texto: "Por favor selecciona un archivo CSV válido."})

        return;
      }
      setFileName(result.assets[0].name);

      const fileUri = result.assets[0].uri;
      const fileContent = await readAsStringAsync(fileUri, {
        encoding: EncodingType.UTF8,
      });

      const parsedData = Papa.parse(fileContent, { header: true });

      if(contactobool){
        validateCsvContactos(parsedData.data);

      }else{
        validateCsvRepartos(parsedData.data);

      }
    } catch (error) {
      setMensajeSnack({bool:true, texto: "No se pudo leer el archivo."});

      
    }
  };

  const validateCsvRepartos = (datos:any) => {
    if (datos.length === 0) {
      setMensajeSnack({bool:true, texto: "El archivo CSV esta vacío."});

      return;
    }

    const headers = Object.keys(datos[0]);

    const requiredHeadersRepartos = ["id","nombre","direccion","descripcion","finalizado","lat","lng","notas","telefono","tipo_contacto","IDContacto","fecha"];
    const isValid = requiredHeadersRepartos.every((header) => headers.includes(header));
   

      if (!isValid) {
        setMensajeSnack({bool: true, texto: "El CSV no tiene las columnas correctas."})
      } else {
        const data:Array<IRepartosSQL> = datos;
        data.map((e,index)=>{
          async function insertData(){
            setImportarModal({bool:true,finish:false,contacto:false,importado: false})
            const fecha = new Date().toISOString().slice(0, 19).replace('T', ' '); // Formato YYYY-MM-DD HH:MM:SS      //agregar 3 campos mas para que funcione
            const finalizado = e.finalizado && e.finalizado == true ? true:false;
            const resultado = 
            await db.runAsync('INSERT INTO repartos (nombre,direccion,telefono,tipo_contacto,descripcion,lat,lng,IDContacto,fecha,finalizado) VALUES (?,?,?,?,?,?,?,?,?,?)',
               e.nombre, e.direccion, e.telefono, e.tipo_contacto, 
               e.descripcion, e.lat, e.lng, 
                null, 
               fecha, finalizado);
        if (resultado && resultado?.lastInsertRowId) {
          setImportarModal({bool:true,finish:true,contacto:false,importado:true})
  
          }else{
            setImportarModal({bool:true,finish:true,contacto:false,importado:false})
          }
          }
          insertData();
          pedirRepartos();
        });     
    }
  };
  const validateCsvContactos = (datos:any) => {
    if (datos.length === 0) {
      setMensajeSnack({bool:true, texto: "El archivo CSV esta vacío."});

      return;
    }

    const headers = Object.keys(datos[0]);

    const requiredHeadersContactos = ["id","nombre","direccion","notas","telefono","lat","lng","tipo"];
    const isValid = requiredHeadersContactos.every((header) => headers.includes(header));

    if (!isValid) {
      setMensajeSnack({bool: true, texto: "El CSV no tiene las columnas correctas."})
    } else {
      const data:Array<IcontactosSQL> = datos;
      data.map((e,index)=>{
        async function insertData(){
          setImportarModal({bool:true,finish:false,contacto:true,importado: false})
           const resultado =  await db.runAsync('INSERT INTO contactos (nombre,direccion,telefono,tipo,notas,lat,lng) VALUES (?,?,?,?,?,?,?)',
           e.nombre, e.direccion,e.telefono,e.tipo,e.notas, e.lat,e.lng);
      if (resultado && resultado?.lastInsertRowId) {
        setImportarModal({bool:true,finish:true,contacto:true,importado:true})

        }else{
          setImportarModal({bool:true,finish:true,contacto:true,importado:false})
        }
        }
        insertData();
        pedirContactos();

      });      
    }
  };


  const exportCsvRepartos = async () => {
    try {
      // const repartosSQL: IRepartosSQL[] = await db.getAllAsync("SELECT * FROM repartos WHERE finalizado=1");
      const repartosSQL: IRepartosSQL[] = await db.getAllAsync("SELECT * FROM repartos");
      const csv = Papa.unparse(repartosSQL);

      const fileUri = documentDirectory + "rutapp_repartos.csv";

      await writeAsStringAsync(fileUri, csv, {
        encoding: EncodingType.UTF8,
      });

      setMensajeSnack({bool:true, texto: "Se exportó CSV de repartos con éxito."});

      if (await isAvailableAsync()) {
        await shareAsync(fileUri);
      } else {
        setMensajeSnack({bool:true, texto: "No se puede compartir el archivo en este dispositivo."});
     
      }
    } catch (error) {
      setMensajeSnack({bool:true, texto: "No se pudo exportar el archivo."});
    }
  };
  const exportCsvContactos = async () => {
    try {
      const contactosSQL: IcontactosSQL[] = await db.getAllAsync("SELECT * FROM contactos");
      const csv = Papa.unparse(contactosSQL);

      const fileUri = documentDirectory + "rutapp_contactos.csv";

      await writeAsStringAsync(fileUri, csv, {
        encoding: EncodingType.UTF8,
      });

      setMensajeSnack({bool:true, texto: "Se exportó CSV de contactos con éxito."});

      if (await isAvailableAsync()) {
        await shareAsync(fileUri);
      } else {
        setMensajeSnack({bool:true, texto: "No se puede compartir el archivo en este dispositivo."});
      }
    } catch (error) {
      setMensajeSnack({bool:true, texto: "No se pudo exportar el archivo."});
    }
  };
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
       paddingTop: 10,
        gap: 20,
      }}
    >
      <Text
        style={{
          letterSpacing: 3,
          textTransform: "uppercase",
          fontWeight: "bold",
        }}
      >
        {" "}
        Contactos
      </Text>

      <Button
        mode="elevated"
        style={{
          backgroundColor: "#FFFCF0",
          borderWidth: 1,
          borderColor: "black",
        }}
        icon={"account-box"}
        onPress={()=>pickCsvFile(true)}
      >
        {" "}
        Importar Contactos
      </Button>
      <Button
        mode="elevated"
        style={{
          backgroundColor: "#FFFCF0",
          borderWidth: 1,
          borderColor: "black",
        }}
        icon={"account-box"}
        onPress={exportCsvContactos}
      >
        {" "}
        Exportar Contactos
      </Button>

      <Text
        style={{
          letterSpacing: 3,
          textTransform: "uppercase",
          fontWeight: "bold",
        }}
      >
        {" "}
        Repartos
      </Text>
      <Button
        mode="elevated"
        style={{
          backgroundColor: "#FFFCF0",
          borderWidth: 1,
          borderColor: "black",
        }}
        icon={"truck-fast-outline"}
        onPress={()=>pickCsvFile(false)}
      >
        {" "}
        Importar Repartos
      </Button>

      <Button
        mode="elevated"
        style={{
          backgroundColor: "#FFFCF0",
          borderWidth: 1,
          borderColor: "black",
        }}
        icon={"truck-fast-outline"}
        onPress={exportCsvRepartos}
      >
        {" "}
        Exportar Repartos
      </Button>
      <Portal>
        <Dialog style={{borderWidth: 1, borderColor: "black", backgroundColor: "#FFFCF0" }}
        visible={importarModal.bool}
         onDismiss={() => setImportarModal({bool:false,finish:true, contacto:true,importado: false})}
         >
          <Dialog.Title>{!importarModal.finish ? "importando datos...": "Datos importados a tus base de datos"}</Dialog.Title>
          <Dialog.Content>
            {!importarModal.finish  && <ActivityIndicator/> }
            {importarModal.finish && <Text variant="bodyMedium"> 
              {importarModal.contacto && importarModal.importado &&
              "Se importó correctamente los contactos" } 
              {!importarModal.contacto && importarModal.importado &&
              "Se importó correctamente los repartos" }
              {importarModal.contacto && !importarModal.importado &&
              "Hubo error al importar contactos" }
               {!importarModal.contacto && !importarModal.importado &&
              "Hubo error al importar repartos" }
              </Text>}
          </Dialog.Content>
          
        </Dialog>
      </Portal>
    </View>
  );
};

export default ImportarExportarScreen;
