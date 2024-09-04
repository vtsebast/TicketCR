﻿(function () {


const container = document.querySelector(".screen-container");
const count = document.getElementById("count");
const total = document.getElementById("total");
const ticketTypeSelect = document.getElementById("ticketTypeSelect");
const numOfRowsInput = document.getElementById("numOfRows");
const numOfSeatsInput = document.getElementById("numOfSeats");
const createSeatsButton = document.getElementById("createSeats");
const clearSeatsButton = document.getElementById("clear-seats");
const selectedSeatHelper = document.getElementById("selectedSeatHelper");
const seatsContainer = document.getElementById("seatsContainer");
const closeModalButton = document.getElementById("close-modal-button");
const event = new Event("SeatsChanged");

const ticketTypeClasses = {
    "particular": "particular",
    "estudiante": "estudiante",
    "adulto mayor": "adulto",
    "regalía": "regalia",
};

/*const boletos = [
    {
        "tipo": "Particular",
        "cantidad": "6",
        "costo": "6"
    },
    {
        "tipo": "Estudiante",
        "cantidad": "5",
        "costo": "5"
    }
]*/

    //info plantilla ya la recibe de el modelo en la vista.
let boletos = infoPlantilla.boletos;
let seatPrices = infoPlantilla.seatPrices;
let seatTypes = infoPlantilla.seatTypes;
let ticketType = ticketTypeSelect.value;
let soldSeatsArray = JSON.parse(localStorage.getItem("soldSeats")) || [];
let alreadySoldSeatsArray = infoPlantilla.soldSeatsArray || [];

    console.log("alreadySoldSeats", alreadySoldSeatsArray);
    console.log("soldSeatsArray", soldSeatsArray);
//default
const ticketPrices = {
    "particular": 100,
    "estudiante": 200,
    "adulto mayor": 300,
    "regalía": 400,
};


let seats;



function isValidTicket(boleto) {
    // Comprobando si los campos existen y son del tipo correcto
    return boleto.hasOwnProperty('costo') && typeof boleto.costo === 'string' &&
        boleto.hasOwnProperty('cantidad') && typeof boleto.cantidad === 'string' &&
        boleto.hasOwnProperty('tipo') && typeof boleto.tipo === 'string';
}


function updateTicketPrices() {

    boletos = infoPlantilla.boletos;
    console.log("Boletos obtenidos en TicketPrices:", boletos);

    if (!boletos) return;

    boletos.forEach(boleto => {
        if (isValidTicket(boleto)) {
        const tipo = boleto.tipo.toLowerCase();
        const costo = parseFloat(boleto.costo); // Asegurándonos de que el costo sea un número
            ticketPrices[tipo] = costo;
        }
    });
}

function updateTicketOptions() {
    boletos = infoPlantilla.boletos;

    const selectElement = document.getElementById('ticketTypeSelect');

    // Limpiando las opciones existentes
    selectElement.innerHTML = "";

    if (!boletos) return;

    // Añadiendo las nuevas opciones
    boletos.forEach(boleto => {
        if (isValidTicket(boleto)) {
            const optionElement = document.createElement('option');
            optionElement.value = boleto.tipo.toLowerCase();
            optionElement.textContent = boleto.tipo;
            selectElement.appendChild(optionElement);
        }
    });
}

function getMaxTicketsForType(type) {
    if (!Array.isArray(boletos)) return null;
    for (let boleto of boletos) {
        if (boleto.tipo.toLowerCase() === type) {
            return parseInt(boleto.cantidad, 10);
        }
    }
    return null; // Devuelve null si el tipo de boleto no se encuentra en la lista
}


function createSeats() {

    const numOfRows = Number(infoPlantilla.numOfRows);
    const numOfSeats = Number(infoPlantilla.numOfSeats);

    // Antes de crear los asientos, limpia la información de asientos de la memoria local
    //localStorage.removeItem("selectedSeats");
    //localStorage.removeItem("seatPrices");
    //localStorage.removeItem("seatTypes");

    // También limpia los objetos en memoria que almacenan la información de los asientos
    //seatPrices = {};
    //seatTypes = {};

    if (isNaN(numOfRows) || isNaN(numOfSeats) || numOfRows < 1 || numOfSeats < 1) {
        // alert("Por favor, ingrese un número válido de filas y asientos.");
        // return;
    }

    seatsContainer.innerHTML = '';

    let firstLetterCode = 65; // Unicode para "A"
    let secondLetterCode = 0; // Unicode para "@" (uno menos que "A")

    for (let i = 0; i < numOfRows; i++) {
        let row = document.createElement("div");
        row.classList.add("row");

        for (let j = 0; j < numOfSeats; j++) {
            let seat = document.createElement("div");
            seat.classList.add("seat");

            let seatLabel = document.createElement("span");
            seatLabel.classList.add("seat-label");

            let seatLabelStr = "";
            if (secondLetterCode > 0) {
                seatLabelStr += String.fromCharCode(secondLetterCode + 65); // Sumamos 65 para obtener la letra correcta
            }
            seatLabelStr += String.fromCharCode(firstLetterCode);
            seatLabelStr += (j + 1);
            seatLabel.textContent = seatLabelStr;
            seat.appendChild(seatLabel);
            row.appendChild(seat);
        }

        seatsContainer.appendChild(row);

        // Si ya llegamos a la Z, reiniciamos a la A e incrementamos la segunda letra
        if (firstLetterCode >= 90) {
            firstLetterCode = 65; // Reiniciamos a la A
            secondLetterCode++; // Incrementamos el código de la segunda letra
        } else {
            // Si no hemos llegado a la Z, simplemente incrementamos la primera letra
            firstLetterCode++;
        }
       
        seats = document.querySelectorAll(".row .seat");
        populateUI();
        updateSelectedCount();
    }



}

function setSeatsData(seatIndex, seatPrice, seatType) {
    localStorage.setItem("selectedSeatIndex", seatIndex);
    localStorage.setItem("selectedSeatPrice", seatPrice);
    localStorage.setItem("selectedSeatType", seatType);
}

function updateSelectedCount() {
    const selectedSeats = document.querySelectorAll(".row .seat.selected");
    const seatsIndex = [...selectedSeats].map((seat) => [...seats].indexOf(seat));
    localStorage.setItem("selectedSeats", JSON.stringify(seatsIndex));

    seatInfo = seatsIndex.map((index) => {
        return {
            seatNumber: seats[index].textContent,
            seatType: seatTypes[index],
            seatPrice: seatPrices[index],
        }
    });

    console.log(seatInfo);

    localStorage.setItem("seatInfo", JSON.stringify(seatInfo));

    const selectedSeatsCount = selectedSeats.length;
    let totalAmount = 0;
    for (let index of seatsIndex) {
        totalAmount += Number(seatPrices[index]) || 0;
    }

    count.innerText = selectedSeatsCount;
    total.innerText = totalAmount;

    setSeatsData(ticketTypeSelect.selectedIndex, ticketTypeSelect.value, ticketType);
}

function populateUI() {
    const selectedSeats = infoPlantilla?.selectedSeats;

    if (selectedSeats !== null && selectedSeats.length > 0) {
        seats.forEach((seat, index) => {
            if (selectedSeats.indexOf(index) > -1) {
                seat.classList.add("selected");
                seat.classList.add(ticketTypeClasses[seatTypes[index]]); // Agrega la clase correspondiente al tipo de asiento
            }
        });
    }

    const selectedSeatIndex = localStorage.getItem("selectedSeatIndex");

    if (selectedSeatIndex !== null) {
        ticketTypeSelect.selectedIndex = selectedSeatIndex;
        const selectedOption = ticketTypeSelect.options[ticketTypeSelect.selectedIndex];

        if (selectedOption) {
            ticketType = selectedOption.value;
        } else {

            //messageInformativo('Atención', 'Debe llenar los Boletos previamente.');
        }
    }

    console.log(alreadySoldSeatsArray);


     //pintar los asientos vendidos si es que los hay.
    if (alreadySoldSeatsArray !== null && alreadySoldSeatsArray.length > 0) {
        seats.forEach((seat, index) => {

            let seatNumber = seat.innerText;

            // Find the index of the seat number in the infoPlantilla2.seatInfo array.
            let seatIndex = infoPlantilla.seatInfo.findIndex(seatInfo => seatInfo.seatNumber === seatNumber);

            // Only add the sold and unavailable class if the seatIndex is in the alreadySoldSeatsArray
            if (alreadySoldSeatsArray.includes(seatIndex)) {
                seat.classList.add("sold");
                seat.classList.add("unavailable");
            }
        });
    }


}


    function handleSeatClick(e) {
        let seatIndex;

        if (
            e.target.classList.contains("seat") &&
            !e.target.classList.contains("sold")
        ) {


            // Obtener la cantidad actual de boletos seleccionados para este tipo
            const selectedSeatsOfType = [...document.querySelectorAll(".row .seat.selected." + ticketTypeClasses[ticketType])].length;

            // Obtener la cantidad máxima de boletos para este tipo
            const maxTickets = getMaxTicketsForType(ticketType);

            if (maxTickets === null) {
                // Espacio para tu alerta
                messageInformativo('Atención', 'Este tipo de Boleto no fue seleccionado previamente.');
                return; // Salir temprano si el tipo de boleto no se encuentra
            }

            // Verificar si se ha alcanzado el límite
            if (selectedSeatsOfType >= maxTickets && !e.target.classList.contains("selected")) {
                // Espacio para tu alerta
                // alert("Has alcanzado el límite de boletos para este tipo.");
                messageInformativo('Atención', 'Ya no puede seleccionar más para este tipo de boleto.');
                return; // Salir temprano si se ha alcanzado el límite
            }



            // hace la selección.
            e.target.classList.toggle("selected");
            if (e.target.classList.contains("selected")) {
                seatIndex = [...seats].indexOf(e.target);
                seatPrices[seatIndex] = ticketPrices[ticketTypeSelect.value];
                seatTypes[seatIndex] = ticketType;
                e.target.classList.add(ticketTypeClasses[ticketType]);  // Añade la clase de color correspondiente
                localStorage.setItem("seatPrices", JSON.stringify(seatPrices));
                localStorage.setItem("seatTypes", JSON.stringify(seatTypes));
            } else {
                e.target.classList.remove(ticketTypeClasses[seatTypes[seatIndex]]); // Elimina la clase de color si el asiento es deseleccionado
            }
            updateSelectedCount();
        }
    }

        function handleSoldSeat(e) {
        let seatIndex;

        // Primero, verifica si el elemento clickeado es un asiento.
            if (e.target.classList.contains("seat")) {

            // Fetch the seat number from e.target's inner text.
            let seatNumber = e.target.innerText;

            // Find the index of the seat number in the infoPlantilla2.seatInfo array.
            seatIndex = infoPlantilla.seatInfo.findIndex(seat => seat.seatNumber === seatNumber);
            if (seatIndex === -1) return;  // Seat number not found in the array.

            // Establece una bandera para verificar si el asiento tiene alguna de las clases de ticketTypeClasses
            let hasTicketTypeClass = Object.values(ticketTypeClasses).some((ticketClass) => e.target.classList.contains(ticketClass));
                if (!hasTicketTypeClass) return;

            // Si el asiento tiene una de las clases ticketTypeClasses y no está vendido, márcalo como vendido.
                if (!e.target.classList.contains("sold") && !e.target.classList.contains("unavailable")) {
                e.target.classList.add("sold");

                // Añade el índice del asiento a la lista seatsSolds.
                if (!soldSeatsArray.includes(seatIndex)) {
                    soldSeatsArray.push(seatIndex);
                }

                } else if (e.target.classList.contains("sold") && !e.target.classList.contains("unavailable")) {
                // Si el asiento ya estaba vendido, entonces quita la clase 'sold' y remuévelo de seatsSolds.
                e.target.classList.remove("sold");

                soldSeatsArray = soldSeatsArray.filter(index => index !== seatIndex);
            }

            // Actualizar el localStorage con la información de seatsSolds.
            localStorage.setItem("soldSeats", JSON.stringify(soldSeatsArray));         
        }
    }


    function getSoldSeatsInfo(array, seatInfo) {
        return array.map(seatIndex => seatInfo[seatIndex]).filter(Boolean);
    }

    function saveScreenData() {

  
             const soldSeatsInfo = getSoldSeatsInfo(soldSeatsArray, infoPlantilla.seatInfo);

        if (!soldSeatsInfo) return console.warn("información de asientos no recibida en escenario1.");
       
        localStorage.setItem("soldSeatsInfo", JSON.stringify(soldSeatsInfo));


        const unitedSoldSeatsArray = [...alreadySoldSeatsArray, ...soldSeatsArray];

        const newInfoPlantilla = {
            ...infoPlantilla,
            soldSeatsArray: unitedSoldSeatsArray,
        }

        localStorage.setItem("InfoPlantilla", JSON.stringify(newInfoPlantilla));

        //se envia a guardar la nueva infoPlantilla a la base de datos.

        window.dispatchEvent(event);

 /*   const numOfRows = localStorage.getItem('numOfRows');
    const numOfSeats = localStorage.getItem('numOfSeats');
    const seatInfo = JSON.parse(localStorage.getItem('seatInfo'));
    let boletos = JSON.parse(localStorage.getItem('boletos'));
    let selectedSeats = JSON.parse(localStorage.getItem("selectedSeats"));
    let seatPrices = JSON.parse(localStorage.getItem("seatPrices"));
    let seatTypes = JSON.parse(localStorage.getItem("seatTypes"));

    const InfoPlantilla = {
        numOfRows,
        numOfSeats,
        seatInfo,
        boletos,
        selectedSeats,
        seatPrices,
        seatTypes,
    };



    console.log(JSON.stringify(InfoPlantilla));
    localStorage.setItem("InfoPlantilla", JSON.stringify(InfoPlantilla));*/
  
  
  
    
}

/*function clearSeats() {
    const selectedSeats = document.querySelectorAll(".row .seat.selected");

    selectedSeats.forEach(seat => {
        seat.classList.remove("selected");
        seat.classList.remove(...Object.values(ticketTypeClasses));  // Remueve todas las clases de tipo de asiento
    });

    localStorage.removeItem("selectedSeats"); // Borra los asientos seleccionados de la memoria local
    localStorage.removeItem("seatPrices"); // Borra los precios de los asientos de la memoria local
    localStorage.removeItem("seatTypes"); // Borra los tipos de asiento de la memoria local
    seatPrices = {}; // Limpia el objeto de precios de asiento
    seatTypes = {}; // Limpia el objeto de tipos de asiento
    seatInfo = []; // Limpia el array de info de asiento
    localStorage.removeItem("seatInfo"); // Borra la info de asiento de la memoria local

    updateSelectedCount();

}
*/

/*function setNumOfRowsAndSeats() {
    const numOfRows = numOfRowsInput.value;
    const numOfSeats = numOfSeatsInput.value;

    localStorage.setItem('numOfRows', numOfRows);
    localStorage.setItem('numOfSeats', numOfSeats);
}
*/

/*function getNumOfRowsAndSeats() {
    numOfRowsInput.value = localStorage.getItem('numOfRows') || 13; 
    numOfSeatsInput.value = localStorage.getItem('numOfSeats') || 10; 
}*/

closeModalButton.addEventListener("click", saveScreenData);

createSeatsButton.addEventListener("click", createSeats);

//clearSeatsButton.addEventListener("click", clearSeats);

ticketTypeSelect.addEventListener("change", (e) => {

    for (let type in ticketTypeClasses) {
        selectedSeatHelper.classList.remove(ticketTypeClasses[type]);
    }

    // Luego, agregamos la clase correspondiente al tipo de boleto seleccionado
    selectedSeatHelper.classList.add(ticketTypeClasses[e.target.value]);

    ticketType = e.target.value;
    if (e.target.selectedIndex !== null) {
        seatPrices[ticketType] = ticketPrices[e.target.value];
        localStorage.setItem("seatPrices", JSON.stringify(seatPrices));
        updateSelectedCount();
    }
});

    container.addEventListener("click", handleSoldSeat);


/*numOfRowsInput.addEventListener("change", () => {
    setNumOfRowsAndSeats();
    createSeats(); // Esto recreará los asientos con el nuevo número de filas
});

numOfSeatsInput.addEventListener("change", () => {
    setNumOfRowsAndSeats();
    createSeats(); // Esto recreará los asientos con el nuevo número de asientos por fila
});*/


/*function handleLocalStorageChange() {
    clearSeats();
    updateTicketOptions();
    updateTicketPrices();
}

// Registramos el evento en la misma ventana
window.addEventListener("localStorageChange", handleLocalStorageChange);

*/

function limpiarValores() {
    localStorage.removeItem("selectedSeats");
    localStorage.removeItem("soldSeats");
    localStorage.removeItem("seatPrices");
    localStorage.removeItem("seatTypes");
    localStorage.removeItem("seatInfo");
    localStorage.removeItem("numOfRows");
    localStorage.removeItem("numOfSeats");
    localStorage.removeItem("InfoPlantilla");
    localStorage.removeItem("soldSeatsInfo");
    localStorage.removeItem("selectedSeatIndex");
    localStorage.removeItem("selectedSeatPrice");
    localStorage.removeItem("selectedSeatType");
    }


    window.addEventListener('beforeunload', function (event) {
        limpiarValores();
    });


window.onload = function () {
    updateTicketOptions();
    updateTicketPrices();
    };




   

    const validateSoldStatus = () => {
        let seatInfoInPlantilla = infoPlantilla.seatInfo;
       

        if (seatInfoInPlantilla.length > 0 && alreadySoldSeatsArray.length >0) {
            if (seatInfoInPlantilla.length === alreadySoldSeatsArray.length) {
                messageInformativo('Atención', 'Todos los boletos para este evento ya fueron vendidos.');
            }
        }
    }

    validateSoldStatus();

createSeats();
updateSelectedCount();


})();