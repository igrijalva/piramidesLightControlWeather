//const axios = require('axios');
import fetch from 'node-fetch';
//import fetch from 'node-fetch';
import { exec } from "child_process";

// URL de la API REST que deseas consumir
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather?lat=20.542264&lon=-100.450079&units=metric&appid=1c4fcb9e49e2f65b288fdc1897accb65';

const sala = 23;
const arbol = 17;
const pinOn = 0;
const pinOff = 1;


// Realiza una solicitud GET a la API
//axios.get(apiUrl)
//  .then(response => {
    // Maneja la respuesta de la API aquí
    //console.log('Datos de la API:', response.data);
//    console.log('*********************************');
//    console.log('País: '+response.data.sys.country);
//    console.log('Localidad: '+response.data.name);
//     console.log('Temperatura: '+response.data.main.temp);
//     console.log('Amanecer: '+response.data.sys.sunrise);
//     console.log('Atardecer: '+response.data.sys.sunset);
//     console.log('*********************************');
//     validateTime(response.data.sys.sunrise, response.data.sys.sunset);
//   })
//   .catch(error => {
//     // Maneja los errores en caso de que ocurran
//     console.error('Error al consumir la API:', error);
//   });


// Realiza una solicitud GET a la API
fetch(apiUrl)
.then(response => response.json()) // Convierte la respuesta a JSON
.then(data => {
  // Maneja los datos de la API aquí
  //console.log('Datos de la API:', data);
  console.log('*********************************');
    console.log('País: '+data.sys.country);
    console.log('Localidad: '+data.name);
    console.log('Temperatura: '+data.main.temp);
    console.log('Amanecer: '+data.sys.sunrise);
    console.log('Atardecer: '+data.sys.sunset);
    console.log('*********************************');
    validateTime(data.sys.sunrise, data.sys.sunset);
})
.catch(error => {
  // Maneja los errores en caso de que ocurran
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