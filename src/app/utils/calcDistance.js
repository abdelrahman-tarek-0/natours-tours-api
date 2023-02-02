exports.unitFromToMetersMap = {
    mi: 1609.344,
    km: 1000,
    m: 1,
    cm: 0.01,
 }


exports.calcBetween2points = ([lat1,lng1],[lat2,lng2],unit="km")=>{
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
             Math.cos(φ1) * Math.cos(φ2) *
             Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return ((R * c))/(this.unitFromToMetersMap[unit] || 1000); // in metres
}