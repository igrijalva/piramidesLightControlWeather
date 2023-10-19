import https from 'https';
import { exec } from "child_process";

// URL de la API REST que deseas consumir
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather?lat=20.542264&lon=-100.450079&units=metric&appid=1c4fcb9e49e2f65b288fdc1897accb65';

const sala = 23;
const arbol = 17;
const pinOn = 0;
const pinOff = 1;


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
        console.log('País: '+jsonData.sys.country);
        console.log('Localidad: '+jsonData.name);
        console.log('Temperatura: '+jsonData.main.temp);
        console.log('Amanecer: '+jsonData.sys.sunrise);
        console.log('Atardecer: '+jsonData.sys.sunset);
        console.log('*********************************');



      } catch (error) {
        // Maneja el error si no se puede analizar la respuesta como JSON
        console.error('Error al analizar los datos de la API:', error);
      }
    });
  }).on('error', (error) => {
    // Maneja los errores de la solicitud HTTP
    console.error('Error al consumir la API:', error);
  });


  function validateTime(sunrise, sunset) {
    const currentDate = new Date();
    const sunriseDate = new Date( parseInt(sunrise)*1000 );
    const sunsetDate = new Date( parseInt(sunset)*1000 );
    console.log('*********************************');
    console.log('Actual:    '+currentDate.toLocaleString()+'    '+currentDate.getHours()+':'+currentDate.getMinutes());
    console.log('Amanecer:  '+sunriseDate.toLocaleString()+'    '+sunriseDate.getHours()+':'+sunriseDate.getMinutes());
    console.log('Atardecer: '+sunsetDate.toLocaleString() +'    '+sunsetDate.getHours() +':'+sunsetDate.getMinutes() );
    console.log('*********************************');
    

    // Verifica Amanecer
    if(currentDate.getHours()==sunriseDate.getHours() && currentDate.getMinutes()==sunriseDate.getMinutes() ) {
        console.log('Ahora es el Amanecer: '+sunriseDate.getHours()+':'+sunriseDate.getMinutes() );
        console.log('Apagando luces...');
        executeCommand(sala, pinOff);
        executeCommand(arbol, pinOff);
    }

    //Verifica Atrdecer
    if(currentDate.getHours()==sunsetDate.getHours() && currentDate.getMinutes()==sunsetDate.getMinutes() ) {
        console.log('Ahora es el Atardecer: '+sunsetDate.getHours()+':'+sunsetDate.getMinutes() );
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