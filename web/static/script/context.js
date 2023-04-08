let context = {
    map: undefined,
    openChartWindow: undefined,
    openInfoWindow: undefined,
    markers: [],         
    applicationTime: new Date(Date.now())
  };

let routeParams = {
  origin: { 'Lat' : 53.3547, 'Long' :	-6.27868 },
  destination: { 'Lat' : 53.3398, 'Long' :	-6.25199 },
}
  
export { context, routeParams }