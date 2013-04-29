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
    p.size(g.config.width*g.config.density, g.config.height*g.config.density);
    $(p.externals.canvas).width(g.config.width);
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
    var newdata = {
        events:data, 
        start:data[0].time, 
        end:data[data.length-1].time
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
    h = p.height;

    drawPermissionLines();

    p.translate(150,0);

    p.stroke(0);
    p.strokeWeight(3);
    //p.line(0, h*0.8, w, h*0.8);
    p.strokeWeight(1);

    drawForeground();
    for (var i=0; i<g.data.events.length; i++) {
      var item = g.data.events[i];
      var percent = (item.time-g.data.start)/(g.data.length);
      p.pushMatrix();
      p.pushStyle();
      p.translate(percent*w, 0);
      drawListItem(item);
      p.popStyle();
      p.popMatrix();
    }
    for (var i=0; i<g.data.events.length; i++) {
      var item = g.data.events[i];
      var percent = (item.time-g.data.start)/(g.data.length);
      p.pushMatrix();
      p.pushStyle();
      p.translate(percent*w, 0);
      drawListText(item);
      p.popStyle();
      p.popMatrix();
    }

  }

  permissions = {
    "android.permission.READ_PHONE_STATE":                   { category: "info-l", severity: 1, placement: 1, display:"Read Phone State"},
    "android.permission.GET_ACCOUNTS":                       { category: "info-l", severity: 1, placement: 2, display:"Get Account Info"},
    "android.permission.ACCESS_FINE_LOCATION":               { category: "info-m", severity: 2, placement: 3, display:"Access Fine Location"},
    "android.permission.READ_CONTACTS":                      { category: "info-m", severity: 2, placement: 4, display:"Read Contacts"},
    "android.permission.READ_CALL_LOG":                      { category: "info-m", severity: 2, placement: 5, display:"Read Call Log"},
    "android.permission.READ_SMS":                           { category: "info-m", severity: 2, placement: 6, display:"Read SMS"},
    "com.android.browser.permission.READ_HISTORY_BOOKMARKS": { category: "info-m", severity: 2, placement: 7, display:"Read Browser History"},
//    "android.permission.READ_CALENDAR":                      { category: "info-m", severity: 2, placement: 8, display:"Read Calendar"},
  }



  function drawPermissionLines() {
    var blocksize = h/g.config.spacings;

    p.textFont(g.font, 12);
    for (i in permissions) {
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
       var todraw = permissionStack.pop();
        p.pushStyle();
        p.noStroke();
        p.fill(255,200,150,20);
        p.rectMode(p.CORNERS);
        p.rect(todraw.x, 0, item_x, h);

        p.popStyle();
      }
    }
  }

  function drawListItem(item) {
    if (item.resultOfCheck == -1) return;
    var permission = permissions[item.permission];
    var blockwidth = 0;
    var blocksize = h/g.config.spacings;
    var blockheight = blocksize;
    var texttop = blocksize * g.config.textline;
    if (permissions[item.permission]) {
      if (permission.category == "info-l") {
        p.fill( 245, 184, 0, 84);
      } else if (permission.category == "info-m") {
        p.fill( 221, 17, 17, 84);
      } else if (permission.category == "info-s") {
        p.fill(210, 100, 80, 100);
      }
      if (permission.severity == 1) {
        blockwidth = 20;
      } else if (permission.severity == 2) {
        blockwidth = 20;
      } else if (permission.severity == 3) {
        blockwidth = 20;
      }
      console.log("Drawing permissino: "+item.permission);
      //p.rect(0, blocksize*permission.placement+15, blockwidth, blockheight-15);
      blockwidth = 15;
      p.noStroke();
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

  var lastinternet = 0;
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
      if (lastinternet < item.time - 1000) {
        p.rotate(p.HALF_PI);
        p.fill(0);
        p.textFont(g.font, 10);
        p.textAlign(p.LEFT);
        var out = item.message;
        var maxlen = 60;
        if (out.length > maxlen) {
          out = out.substring(0, maxlen)+"...";
        }
        //p.text(out, h-10, -2);//-11);
        p.text(out, h-texttop, -2);
      }
      lastinternet = item.time;
    } else if (item.permission.indexOf("android.activity.ACTION") != -1) {
     if (item.message == "null") {
      item.message = "";
     }
     if (item.permission == "android.activity.ACTION.ACTIVITY_START") {
      item.message = "Start: "+item.message;
     }
     if (item.permission == "android.activity.ACTION.ACTIVITY_STOP") {
      item.message = "Stop: "+item.message;
     }
      p.rotate(p.HALF_PI);
      p.fill(0);
      p.textFont(g.font, 16);
      p.textAlign(p.LEFT);
      p.text(item.message, h-texttop, 15);
      console.log(item.message);
    }



  }

}

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
