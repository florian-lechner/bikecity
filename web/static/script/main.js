import { drawMap } from "./map.js";
import { searchBoxes } from "./search.js";

function main()  {
    drawMap();
    searchBoxes();
}

console.log("test")

window.initMap = main;
