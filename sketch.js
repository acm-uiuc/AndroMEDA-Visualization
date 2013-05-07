var datasrc = "/data/vizdata/lookout/lookout_malware.json";
if (window.location.hash) {
  datasrc = window.location.hash.replace("#","");
}

var config = {
  width: 1300,
  height: 500,
  density: 2,
  dataurl: datasrc,//'/data/vizdata/lookout/lookout_malware.json',

  spacings: 17,
  textline: 9.5,
};

function sketch(p) {
  var g = {
    ready: false,
    config: config,
  };
  


  console.log("Runningish");
  p.setup = function() {
    g.font = p.createFont("Roboto-Light", 32);
    p.textFont(g.font);
    console.log("Setup");
    g.config.width = window.innerWidth;
    p.size(window.innerWidth*g.config.density, g.config.height*g.config.density);
    $(p.externals.canvas).width(window.innerWidth);
    $(p.externals.canvas).height(g.config.height);

    $.ajax(config.dataurl, {dataType:"html"})
     .done(function(rawdata, textStatus, jqXHR) {
       var newdata = [];
       $.each(rawdata.split("\n"),function(k,v) {
        try {
         newdata.push(JSON.parse(v));
        } catch (e) {
         console.log(e);
        }
       });
       g.data = workOnData(newdata);
       console.log(g.data);
       drawGraph(); 
     })
    .fail(function(jqXHR, textStatus, errorThrown) {
     console.log("data req failed");
    });
    $("#download").click(function() {
      p.save();
    });
  };

  function workOnData(data) {
    var olddata = data;
    var data = data.filter(function(item) {
     if (item.message && item.message.indexOf("ContextImpl") != -1) 
      return false; // considering removing them.
     if (permissions[item.permission] || events[item.permission])
      return true;
     return false;
    });
    if (data.length == 0) {
     data = olddata;
    }
    seenpermissions = {};
    seenarray = [];
    data.forEach(function(item, index) {
     if (permissions[item.permission]) {
      if (!seenpermissions[item.permission]) {
       seenarray.push({permission:item.permission, data:permissions[item.permission]})
      }
      seenpermissions[item.permission] = permissions[item.permission];
     }
    });
    seenarray.sort(function(item1, item2) {
     return (item1.data.severity > item2.data.severity );
    });
    seenarray.forEach(function(item, index) {
     seenpermissions[item.permission].placement = index+1;
    });

    var newdata = {
        events:data, 
        start:data[0].time, 
        end:data[data.length-1].time,
        seenpermissions: seenpermissions,
    };
    newdata.length = newdata.end-newdata.start;
    console.log(newdata);
    return newdata;
  }

  function drawGraph() {
    p.background(255);
    p.scale(g.config.density,g.config.density);
    p.width = g.config.width;
    p.height = g.config.height;
    w = p.width-200;
    h = p.height-20;

    drawPermissionLines();


    p.translate(150,0);

    drawTimeTicks();

    p.stroke(0);
    p.strokeWeight(3);
    //p.line(0, h*0.8, w, h*0.8);
    p.strokeWeight(1);

    drawForeground();
    g.data.events.forEach(function(item) {
      var percent = (item.time-g.data.start)/(g.data.length);
      p.pushMatrix();
      p.pushStyle();
      p.translate(percent*w, 0);
      drawListItem(item);
      p.popStyle();
      p.popMatrix();
    });
    g.data.events.forEach(function(item) {
      var percent = (item.time-g.data.start)/(g.data.length);
      p.pushMatrix();
      p.pushStyle();
      p.translate(percent*w, 0);
      drawListText(item);
      p.popStyle();
      p.popMatrix();
    });

  }

  var permissions = {
    "android.permission.READ_PHONE_STATE":                   { category: "info-l", severity: 1, placement: 1, display:"Read Phone State"},
    "android.permission.READ_PROFILE":                       { category: "info-l", severity: 1, placement: 1, display:"Read Personal Profile"},
    "android.permission.GET_ACCOUNTS":                       { category: "info-l", severity: 1, placement: 2, display:"Get Account Info"},
    "android.permission.ACCESS_COARSE_LOCATION":             { category: "info-l", severity: 1, placement: 3, display:"Access Coarse Location"},
    "android.permission.RECEIVE_BOOT_COMPLETED":             { category: "info-l", severity: 1, placement: 3, display:"Start on Boot"},
    "android.permission.ACCESS_FINE_LOCATION":               { category: "info-m", severity: 2, placement: 3, display:"Access Fine Location"},
    "android.permission.READ_CONTACTS":                      { category: "info-m", severity: 2, placement: 4, display:"Read Contacts"},
    "android.permission.READ_CALENDAR":                      { category: "info-m", severity: 2, placement: 4, display:"Read Calendar"},
    "android.permission.READ_CALL_LOG":                      { category: "info-m", severity: 2, placement: 5, display:"Read Call Log"},
    "android.permission.READ_SMS":                           { category: "info-m", severity: 2, placement: 6, display:"Read SMS"},
    "android.permission.RECORD_AUDIO":                       { category: "info-m", severity: 2, placement: 6, display:"Record Audio"},
    "android.permission.CAMERA":                             { category: "info-m", severity: 2, placement: 6, display:"Camera"},
    "android.permission.GET_TASKS":                          { category: "info-m", severity: 2, placement: 6, display:"Read Running Apps"},
    "android.permission.READ_LOGS":                          { category: "info-m", severity: 2, placement: 6, display:"Read Sensitive Logs"},
    "android.permission.SYSTEM_ALERT_WINDOW":                { category: "info-m", severity: 2, placement: 6, display:"Draw Over Other Apps"},
    "android.permission.CALL_PHONE":                         { category: "info-m", severity: 2, placement: 6, display:"Call Phones"},
    "com.android.browser.permission.READ_HISTORY_BOOKMARKS": { category: "info-m", severity: 2, placement: 7, display:"Read Browser History"},
    "com.android.launcher.permission.INSTALL_SHORTCUT":      { category: "info-m", severity: 2, placement: 8, display:"Install Launcher Shortcut"},
    "com.android.browser.permission.WRITE_HISTORY_BOOKMARKS":{ category: "info-h", severity: 3, placement: 9, display:"Write Browser History"},
    "android.permission.WRITE_CONTACTS":                     { category: "info-h", severity: 3, placement: 4, display:"Write Contacts"},
    "android.permission.WRITE_CALENDAR":                     { category: "info-h", severity: 3, placement: 4, display:"Write Calendar"},
    "android.permission.WRITE_CALL_LOG":                     { category: "info-h", severity: 3, placement: 5, display:"Write Call Log"},
    "android.permission.WRITE_SMS":                          { category: "info-h", severity: 3, placement: 6, display:"Write SMS"},
  };

  var events = {
   "android.activity.ACTION.ACTIVITY_START":     1,
   "android.activity.ACTION.ACTIVITY_STOP":      1,
   "android.activity.ACTION.BUTTON_CLICK":       1,
   "android.activity.ACTION.VIEW_CLICK":         1,
   "internet.http.client":                       1,
   "internet.http.url":                          1,
  };

  var last = {
   internet: {time: 0, url: ""},
   activity: {time: 0, message: ""},
   start: "",
  };


  function drawPermissionLines() {
    var blocksize = h/g.config.spacings;

    p.textFont(g.font, 12);
    for (i in g.data.seenpermissions) {
      var per = permissions[i];
      var lineh = blocksize * per.placement;
      p.fill(0);
      p.textAlign(p.RIGHT, p.TOP);
      p.text(per.display, 0, lineh-8, 130, 20);
      p.stroke(0,84);
      for (var i=0; i<p.width/3; i++) {
        p.point(134+i*3, lineh);
      }
      //p.line(0, lineh, p.width, lineh);
    }

    var start = new Date(g.data.start);
    p.fill(0);
    p.textAlign(p.LEFT);
    p.text(start.toLocaleString(), 5, p.height-15, 130, 20);
  }

  function drawTimeTicks() {
   p.pushStyle();
   p.textAlign(p.LEFT, p.BOTTOM);
   p.strokeWeight(1);

   var start = g.data.start;
   var end = g.data.end;
   var len = g.data.length;
   var tick = 1000*60;
   var firstminute = Math.ceil(start/(tick))*tick;
   var offset = start - firstminute;
   p.stroke(0);
   p.line(0, p.height-20, 0, p.height);
   p.stroke(50);
   for (var i=firstminute; i<end; i+= tick) {
    var minuteofhour = i / (1000 * 60);
    var x = (i-start)/len*w;
    var spaceUntilNextTick = x - (i-tick-start)/len*w;

    if (minuteofhour % 5 == 0) {
     p.line(x, p.height-15, x, p.height);
     if (spaceUntilNextTick > 30) {
      p.text(moment(i).format("h:mm"), x+2, p.height);
     }
    } else {
     p.line(x, p.height-7, x, p.height);
    }
   }
   p.stroke(0);

   p.popStyle();

  }

  function drawForeground() {
    var permissionStack = [];
    for (var i=0; i<g.data.events.length; i++) {
      var item = g.data.events[i];
      var percent = (item.time-g.data.start)/(g.data.length);
      var item_x = percent * w;
      if (item.permission == "android.activity.ACTION.ACTIVITY_START") {
       permissionStack.push({item: item, x:item_x});
      } if (item.permission == "android.activity.ACTION.ACTIVITY_STOP") {
       if (permissionStack.length == 0) {
        var todraw = {item: "", x:0};
       } else {
        var todraw = permissionStack.pop();
       }
        p.pushStyle();
        p.noStroke();
        if (permissionStack.length == 0) {
         p.fill(0,15);
        } else {
         p.noFill();
        }
        p.rectMode(p.CORNERS);
        p.rect(todraw.x, 0, item_x, h);

        p.popStyle();
      }
    }
    while (permissionStack.length > 0) {
       var todraw = permissionStack.pop();
        p.pushStyle();
        p.noStroke();
        if (permissionStack.length == 0) {
         p.fill(255,200,150,60);
        } else {
         p.fill(255,200,150,20);
        }
        p.rectMode(p.CORNERS);
        p.rect(todraw.x, 0, w, h);
        p.popStyle();
    }
  }

  function drawListItem(item) {
    var permission = permissions[item.permission];
    var blockwidth = 20;
    var blocksize = h/g.config.spacings;
    var blockheight = blocksize;
    var texttop = blocksize * g.config.textline;
    console.log("Dmissino: "+item.permission);
    if (permissions[item.permission]) {
      p.noStroke();
      if (permission.category == "info-l") {
        p.fill( 245, 184, 0, 84);
      } else if (permission.category == "info-m") {
        //p.fill( 233, 100, 10, 84);
        //p.fill( 245, 184, 0, 84);
        p.fill( 221, 17, 17, 84);
      } else if (permission.category == "info-h") {
        //p.fill( 221, 17, 17, 84);
        //p.fill( 153, 51, 204, 120);
        p.fill( 153, 34, 187, 180);
      }
      if (item.resultOfCheck == -1) {
        p.noFill();
        p.stroke(150,150,150,84);
      }
      //console.log("Drawing permissino: "+item.permission);
      //p.rect(0, blocksize*permission.placement+15, blockwidth, blockheight-15);
      blockwidth = 15;
      p.ellipse(0, blocksize*permission.placement, blockwidth, blockwidth);
      p.stroke(0);
      p.ellipse(0, blocksize*permission.placement, 1, 1);

    } else if (item.permission == "internet.http.url" || item.permission == "internet.http.client") {
      p.stroke(0,84);
      p.stroke(17, 170, 221);
      p.strokeWeight(1);
      p.line(0,13,0,h-texttop-10);
      p.stroke(7, 170, 221, 100);
      p.line(0, h-texttop-10,0, h);
      p.noStroke();
      p.stroke(0);
      p.strokeWeight(1);
      //p.fill(100,100,200);
      //p.triangle(0, 0, 0, h*0.03, 10, h*0.03);
      p.noFill();
      p.stroke(17, 170, 221);
      p.strokeWeight(2);
      p.arc(0, 11, 18, 18, -p.HALF_PI-p.HALF_PI/2, -p.HALF_PI/2, p.OPEN);
      p.arc(0, 11, 13, 13, -p.HALF_PI-p.HALF_PI/2, -p.HALF_PI/2, p.OPEN);
      p.arc(0, 11, 8, 8, -p.HALF_PI-p.HALF_PI/2, -p.HALF_PI/2, p.OPEN);
      p.arc(0, 11, 3, 3, -p.HALF_PI-p.HALF_PI/2, -p.HALF_PI/2, p.OPEN);
    } else if (item.permission.indexOf("android.activity.ACTION") != -1) {
      if (item.message == "init") {
        p.stroke(0,150,0,150);
        p.stroke(0,84);
        p.strokeWeight(1);
        p.line(0,0,0,h);
      } else {
        p.stroke(0);
        p.stroke(0,84);
        p.strokeWeight(1);
        p.line(0,0,0,h);
      }

    }

  }

  function drawListText(item) {
    if (item.resultOfCheck == -1) return;
    var blockwidth = 0;
    var blocksize = h/g.config.spacings;
    var blockheight = blocksize;
    var texttop = blocksize * g.config.textline;
    if (permissions[item.permission]) {
      var permission = permissions[item.permission];

      if (permission.displayed == undefined || permission.displayed < item.time - g.data.length/5) {
        p.fill(0);
        p.textFont(g.font, 12);
 //       p.text(permission.display, 0, blocksize*permission.placement+12);
        permission.displayed = item.time;
      }
    } else if (item.permission == "internet.http.url" || item.permission == "internet.http.client") {
      if (last.internet.time < item.time - 1000) {
        p.rotate(-p.HALF_PI);
        p.fill(0);
        p.textFont(g.font, 10);
        p.textAlign(p.LEFT);
        var out = item.message;
        var maxlen = 55;
        if (out.length > maxlen) {
          out = out.substring(0, maxlen)+"...";
        }
        //p.text(out, h-10, -2);//-11);
        p.text(out, -h+2, 9);
      }
      last.internet.time = item.time;
      last.internet.url = item.message;
    } else if (item.permission.indexOf("android.activity.ACTION") != -1) {
      var otherside = false;
      if (item.message == "null") {
       item.message = "Activity";
      }
      if (item.permission == "android.activity.ACTION.ACTIVITY_START") {
       item.message = "Start: "+item.message;
       if (last.start == item.message) {
        item.message = "";
       } else {
        last.start = item.message;
       }
      }
      if (item.permission == "android.activity.ACTION.ACTIVITY_STOP") {
       item.message = "Stop: "+item.message;
       otherside = true;
       item.message = "";
      }
      if (item.permission == "android.activity.ACTION.BUTTON_CLICK") {
       item.message = "Click: "+item.message;
      }
      if (item.permission == "android.activity.ACTION.VIEW_CLICK") {
       item.message = "Click: Button";
      }
      if (last.activity.time < item.time - 1000 && last.activity.message == item.message) {
        //skip it.
      } else {
        p.rotate(-p.HALF_PI);
        p.fill(0);
        p.textFont(g.font, 16);
        p.textAlign(p.LEFT);
        if (otherside) {
          p.text(item.message, -h+2, 14);
        } else {
          p.text(item.message, -h+2, -3);
        }
        console.log(item.message);
        last.activity = {time: item.time, message:item.message};
      }
    }



  }

}
var wherex = 0;

console.log("Starting");
$(function() {
  var canvas = document.getElementById("gridgraph");
  var processingInstance = new Processing(canvas, sketch);
});



Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
