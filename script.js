let names; // names of places
let addresses; // addresses of places
const APIKEY = "235d01dc2ba7463792232a933bb36375";
const currentLocationButton = document.querySelector("#locationButton");
const mainFlex = document.querySelector(".mainFlex");

const autocompleteInput = new autocomplete.GeocoderAutocomplete(
  document.getElementById("autocomplete"),
  APIKEY,
  {
    /* Geocoder options */
  }
);

autocompleteInput.on("select", (location) => {
  // check selected location here
});

autocompleteInput.on("suggestions", (suggestions) => {
  // process suggestions here
});

const searchBar = document.querySelector(".geoapify-autocomplete-input");

currentLocationButton.addEventListener("click", (event) => {
  removeInserted();
  nearbyPlaces();
});

document.addEventListener("keypress", (event) => {
  if (event.code == "Enter") {
    removeInserted();
    geocodeAndGetPlaces(searchBar.value);
  }
});

function renderPlaces(names, addresses) {
  let html = ``;
  for (let i = 0; i < names.length; i++) {
    html += `<div class="inserted" style="background-color:white; font-size:25px;">Supplier: ${names[i]}<br>
    Address: ${addresses[i]}<br>
    Givaway Time: 8:00 pm - 9:00 pm<br>
    </div>
    `;
  }
  mainFlex.insertAdjacentHTML("beforeend", html);
}

function removeInserted() {
  const html = document.querySelectorAll(".inserted");
  html.forEach((element) => element.remove());
}

let requestOptions = {
  method: "GET",
};

// Gets nearby places for current location
// @parameter
// category - type of places (ex. catering, commerical.supermarket, more under categories https://apidocs.geoapify.com/docs/places/#api).
function nearbyPlaces(category = "catering") {
  if ("geolocation" in navigator) {
    // Gets current user location
    navigator.geolocation.getCurrentPosition(function (position) {
      console.log(`${position.coords.latitude}, ${position.coords.longitude}`);
      // Gets the names of all nearby restaurants
      getPlacesNear(
        position.coords.latitude,
        position.coords.longitude,
        5000,
        category
      );
    });
  } else {
    console.log("Use a different browser.");
  }
}

// Gets places near given coordinates
// @parameter
// lat - latitude
// long - longitude
// radius - radius of circle near given coordinates (to search for nearby places). Default is 5000.
// category - type of places (ex. catering, commerical.supermarket, and more under Supported Categories https://apidocs.geoapify.com/docs/places/#api). Default is catering (resturants).
// limit - maximum number of places returned (default is 20).
function getPlacesNear(
  lat,
  long,
  radius = 5000,
  category = "catering",
  limit = 20
) {
  fetch(
    `https://api.geoapify.com/v2/places?categories=${category}&filter=circle:${
      long + "," + lat + "," + radius
    }&limit=${limit}&apiKey=${APIKEY}`
  )
    .then((response) => response.json())
    .then(function (result) {
      console.log(result.features);
      // extracts names
      names = extractProperty(result.features, "name");
      // extracts addresses
      addresses = extractProperty(result.features, "address_line2");
      // renders places
      renderPlaces(names, addresses);
      return result.features;
      //extracts
    })
    .catch((error) => console.log("error", error));
}

// Extracts given property of every element in data
// @parameter
// data - array of features (contains all nearby places)
// property - property to extract out of every place (ex. name, address_line1, address_line2, and more under Response Object https://apidocs.geoapify.com/docs/places/#api)
// @return
// list containing
function extractProperty(data, property) {
  let list = [];
  for (let i = 0; i < data.length; i++) {
    list.push(data[i].properties[property]);
  }
  return list;
}

function geocodeAndGetPlaces(address) {
  address.replaceAll(" ", "%20");
  address.replaceAll(",", "%2C");
  let pos = {
    lat: 0,
    lon: 0,
  };
  fetch(
    `https://api.geoapify.com/v1/geocode/search?text=${address}&format=json&apiKey=${APIKEY}`
  )
    .then((response) => response.json())
    .then(function (result) {
      pos.lat = result.results[0].lat;
      pos.lon = result.results[0].lon;
      getPlacesNear(pos.lat, pos.lon);
    })
    .catch((error) => console.log("error", error));
}
