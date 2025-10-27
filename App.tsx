import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import { AppRegistry } from 'react-native';
import { DefaultTheme, PaperProvider } from 'react-native-paper';
import { RutappContextProvider } from "./context/RutappContext";
import HomeScreen from "./screens/Home/HomeScreen";
import PrincipalMenu from './components/Menus/PrincipalMenu';

export default function App() {
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: 'black', 
      accent: '#FFFCF0',  
      background: '#FFFCF0', 
      surface: '#ffffff', 
      text: '#000000', 
      disabled: '#d3d3d3', 
      placeholder: '#8e8e8e', 
      backdrop: 'rgba(0, 0, 0, 0.5)',
    },
  };
  async function initializeDatabase(db:SQLiteDatabase): Promise<void> {
    try {
      await db.execAsync(`PRAGMA journal_mode = WAL;`);
      await db.execAsync('PRAGMA foreign_keys = OFF;');

      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS contactos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL,
          direccion TEXT NOT NULL,
          notas TEXT,
          telefono INTEGER,
          lat REAL NOT NULL,
          lng REAL NOT NULL, 
          tipo TEXT NOT NULL
        );
      `);
            
      const existeRepartos = await db.getAllAsync(`SELECT name FROM sqlite_master WHERE type='table' AND name='repartos';
        `);
        if(existeRepartos.length>0){
                  await db.execAsync(`
        CREATE TABLE IF NOT EXISTS repartos_nueva (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL,
          direccion TEXT NOT NULL,
          descripcion TEXT,
          finalizado BOOL,
          lat REAL NOT NULL,
          lng REAL NOT NULL,
          notas TEXT,
          telefono INTEGER,
          tipo_contacto TEXT,
          IDContacto INTEGER,
          fecha DATE,
          FOREIGN KEY (IDContacto) REFERENCES contactos(id) ON DELETE SET NULL
        );
      `);
      
      await db.execAsync(`
        INSERT INTO repartos_nueva (id, nombre, direccion, descripcion, finalizado, lat, lng, notas, telefono, tipo_contacto, IDContacto, fecha)
        SELECT id, nombre, direccion, descripcion, finalizado, lat, lng, notas, telefono, tipo_contacto, IDContacto, fecha
        FROM repartos;
      `);
      
      await db.execAsync('DROP TABLE repartos;');
      
      await db.execAsync('ALTER TABLE repartos_nueva RENAME TO repartos;');
        }
        else
        {
          await db.execAsync(`
            CREATE TABLE IF NOT EXISTS repartos (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              nombre TEXT NOT NULL,
              direccion TEXT NOT NULL,
              descripcion TEXT,
              finalizado BOOL,
              lat REAL NOT NULL,
              lng REAL NOT NULL,
              notas TEXT,
              telefono INTEGER,
              tipo_contacto TEXT,
              IDContacto INTEGER,
              fecha DATE,
              FOREIGN KEY (IDContacto) REFERENCES contactos(id) ON DELETE SET NULL
            );
          `);
        }

      
      await db.execAsync('PRAGMA foreign_keys = ON;'); 
    } catch (error) {
        console.log('Error while initializing database : ', error);
    }
}
  return (
    
    <SQLiteProvider databaseName="rutapp_db" onInit={initializeDatabase}>
      <PaperProvider theme={theme}>
      <RutappContextProvider>
        <HomeScreen/>
        <PrincipalMenu/>
        
    </RutappContextProvider>  
    </PaperProvider>
    </SQLiteProvider>
  );
}

AppRegistry.registerComponent('rutapp',()=>App)


