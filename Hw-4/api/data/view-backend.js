//View object contains all view functionalities
var view = {}

//Main view contains actual ip_port pairs
var main_view = process.env.VIEW.split(",");
main_view.sort();
last_view = main_view.slice();

//tracks how many changes to the view we have scene
var viewClock = 0;


view.getMain_view = function(){
    return main_view;
}
view.getLast_view = function(){
    return last_view;
}
view.getViewClock = function(){
    return viewClock;
}

view.getRandomView = function(){

    var views = main_view;
    if(views.length == 1) {
        return false;
    }
    var ip = views[Math.floor(Math.random() * views.length)];
    while(ip == process.env.IP_PORT) ip = views[Math.floor(Math.random() * views.length)];
    return ip;
}

view.insertView = function(ip_port) {
    var indexOf = main_view.indexOf(ip_port);

    if(indexOf != -1) {
        return false;
    }

    last_view = main_view.slice();
    main_view.push(ip_port);
    main_view.sort();
    viewClock++;

    return true;
}

view.deleteView = function(ip_port) {
    var indexOf = main_view.indexOf(ip_port);

    if(indexOf == -1) {
        return false;
    }
    last_view = main_view.slice();
    main_view.splice(indexOf, 1);
    viewClock++;
    return true;
}

//will return new views in an array
view.getViewDiff = function() {

    var arrayOfViews = [];

    for(let i = 0; i < main_view.length; i++){
        if(!(main_view.includes(last_view[i]))){
            arrayOfViews.push(curr_view[i]);
        }
    }

    return arrayOfViews;
}

module.exports = view;
