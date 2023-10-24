const https = require('https');
const { exec } = require("child_process");
const args = require('minimist')(process.argv.slice(2))
const moment = require('moment-timezone');
const fs = require('fs');


const apiUrl = 'https://api.openweathermap.org/data/2.5/weather?lat=20.542264&lon=-100.450079&units=metric&appid=1c4fcb9e49e2f65b288fdc1897accb65';

// Ruta al archivo JSON de configuración
const backupPath = 'backup.json';

// Configuracion de pines de los relevadores
const sala = 23;
const arbol = 17;
const pinOn = 0;
const pinOff = 1;

let configData = {
  country: 'MX',
  name: 'El Puelito',
  temp: 19.26,
  sunrise: 1697805510,
  sunset: 1697847264,
  updated: '2023-10-23T01:59:16-06:00'
};

let currentDate = moment.tz("America/Mexico_City") ;

// Realiza una solicitud GET a la API
https.get(apiUrl, (response) => {
    let data = '';

    // Escucha el evento 'data' para recopilar los datos de la respuesta
    response.on('data', (chunk) => {
      data += chunk;
    });
  
    // Escucha el evento 'end' para procesar los datos completos
    response.on('end', () => {
      try {
        // Convierte los datos JSON en un objeto JavaScript (si corresponde)
        const jsonData = JSON.parse(data);
        // console.log('Datos de la API:', jsonData);

        console.log('*********************************');
        console.log('Datos del API:');
        console.log('Pais: '+jsonData.sys.country);
        console.log('Localidad: '+jsonData.name);
        console.log('Temperatura: '+jsonData.main.temp);
        console.log('Amanecer: '+jsonData.sys.sunrise);
        console.log('Atardecer: '+jsonData.sys.sunset);
        console.log('*********************************');

        configData.country = jsonData.sys.country;
        configData.name = jsonData.name;
        configData.temp = jsonData.main.temp;
        configData.sunrise = jsonData.sys.sunrise;
        configData.sunset = jsonData.sys.sunset;
        configData.updated = currentDate.format();

        writeBackupFile(configData);

        

        // validateTime( currentDate, jsonData.sys.sunrise, jsonData.sys.sunset );
        configData = readBackupFile();


      } catch (error) {
        // Maneja el error si no se puede analizar la respuesta como JSON
        console.error('Error al analizar los datos de la API:', error);
        console.log('****************');
        // validateTime( currentDate, configData.sunrise, configData.sunset );
        configData = readBackupFile();
      }
    });
  }).on('error', (error) => {
    // Maneja los errores de la solicitud HTTP
    console.error('Error al consumir la API:', error);
    console.log('****************');
    configData = readBackupFile();
  });


  function validateTime(currentDate,sunrise, sunset) {

    const sunriseDate = moment.tz( parseInt(sunrise)*1000, "America/Mexico_City" );
    const sunsetDate = moment.tz( parseInt(sunset)*1000, "America/Mexico_City" );
    if(args && args['timestamp']) {
      console.log('timestamp recibido en argumentos: '+args['timestamp']);
      currentDate =  moment.tz( parseInt(args['timestamp'])*1000, "America/Mexico_City" );
    }

    console.log('*********************************');
    console.log('Actual:    '+currentDate.format()+'    '+currentDate.format('H')+':'+currentDate.format('mm'));
    console.log('Amanecer:  '+sunriseDate.format()+'    '+sunriseDate.format('H')+':'+sunriseDate.format('mm'));
    console.log('Atardecer: '+sunsetDate.format() +'    '+sunsetDate.format('H') +':'+sunsetDate.format('mm') );
    console.log('*********************************');
    

    // Verifica Amanecer
    if(currentDate.format('H')==sunriseDate.format('H') && currentDate.format('mm')==sunriseDate.format('mm') ) {
        console.log('Ahora es el Amanecer: '+sunriseDate.format('H')+':'+sunriseDate.format('mm') );
        console.log('Apagando luces...');
        executeCommand(sala, pinOff);
        executeCommand(arbol, pinOff);
    }

    //Verifica Atrdecer
    if(currentDate.format('H')==sunsetDate.format('H') && currentDate.format('mm')==sunsetDate.format('mm') ) {
        console.log('Ahora es el Atardecer: '+sunsetDate.format('H')+':'+sunsetDate.format('mm') );
        console.log('Encendiendo luces...');
        executeCommand(sala, pinOn);
        executeCommand(arbol, pinOn);
    }


  }

  function executeCommand(pin, status) {
    exec(`/home/pi/lightcontrol/pinAction.sh ${pin} ${status}`, (error, stdout, stderr) => {
        if(error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if(stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
  }

  function writeBackupFile(configData) {
    const configJSON = JSON.stringify(configData, null, 2);
    fs.writeFile(backupPath, configJSON, 'utf8', (error) => {
      if (error) {
        console.error('Error al escribir el archivo:', error);
        return;
      }
      console.log('*********************************');
      console.log('Archivo de configuración guardado correctamente.');
      console.log('*********************************');
    });
  }

  function readBackupFile() {
    // Lee el archivo JSON
    fs.readFile(backupPath, 'utf8', (error, data) => {
      if (error) {
        console.error('Error al leer el archivo:', error);
        return;
      }
      // Analiza el contenido JSON
      try {
        const configData = JSON.parse(data);
        console.log('*********************************');
        console.log('Configuración leída:', configData);
        console.log('*********************************');
        validateTime( currentDate, configData.sunrise, configData.sunset );
      } catch (parseError) {
        console.error('Error al analizar el JSON:', parseError);
      }
    });
  }