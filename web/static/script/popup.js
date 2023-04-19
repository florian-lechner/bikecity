import { context } from "./context.js";
import { availabilityCanvas } from "./distance.js";
// import { Chart} from "../../node_modules/chart.js/auto/auto.cjs";


function createMarkerBounce(marker) {

    // Make markers bounce       
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function () {
        marker.setAnimation(null);
    });
}


export { createMarkerBounce }
