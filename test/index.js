const fs = require('fs')
const tesseract = require("node-tesseract-ocr")
const util = require('util')
 
const tesseractConfig = {
  lang: "eng",
  oem: 1,
  psm: 6, //1 or 6, 4 seems to work well too but is described as something else
}

var calculationscount = 0; //counter to see if parsing is complete

const dirTree = require("directory-tree");
const filteredTree = dirTree("SourceImages", { extensions: /\.pNg/i });

var csvstring = "";

const contributionfiles = {
    "food": [],
    "silver": [],
    "iron": [],
    "stone": [],
    "lumber": []
}

/*
const contributions = {
    "food": {"collected": [], "rejected": []},
    "silver": {"collected": [], "rejected": []},
    "iron": {"collected": [], "rejected": []},
    "stone": {"collected": [], "rejected": []},
    "lumber": {"collected": [], "rejected": []}
}
*/

const contributions = {
    "food": {"collected": {}, "rejected": []},
    "silver": {"collected": {}, "rejected": []},
    "iron": {"collected": {}, "rejected": []},
    "stone": {"collected": {}, "rejected": []},
    "lumber": {"collected": {}, "rejected": []}
}

filteredTree.children.forEach((ele, idx) => {
    if (typeof ele.children !== 'undefined') {
        ele.children.forEach( (el, ix) => {
            contributionfiles[ele.name.toLowerCase()].push(el.path);
        });
        //console.log(ele, "NL");
    }
}); 

//console.log(contributionfiles);


for (var type in contributionfiles) {
    let rsstype = type;
    //console.log(rsstype, contributionfiles[type]);
    
    tesseract.recognize(contributionfiles[rsstype], tesseractConfig)
    .then( (textres) => {
        let collected = [];
        let rejected = [];
        
        textres.split("\r\n").forEach( (ele, idx, src) => {
            let found = ele.match(/([^a-z0-9]*?)(([a-z0-9\s])+?)sent resources\.(.+?)(\+*?)([0-9,]+)(.+?)/i);
            if (found === null) {
                if (ele.trim() == "") {
                    //console.error("Null");
                } else {
                    contributions[rsstype].rejected.push(ele);
                }
            } else {
                //contributions[rsstype].collected.push([found[2].trim(), found[6].replace(/,/g, '').trim()]);
                //contributions[rsstype].collected[[found[2].trim()].push(found[6].replace(/,/g, '').trim()]);
                if (typeof contributions[rsstype].collected[found[2].trim()] == "undefined") {
                    contributions[rsstype].collected[found[2].trim()] = [found[6].replace(/,/g, '').trim()];
                } else {
                    contributions[rsstype].collected[found[2].trim()].push(found[6].replace(/,/g, '').trim());
                }
            }
            //console.log(contributions);
        }); 
        
        calculationscount++;
        if (calculationscount >= 5) {
            //console.dir(contributions);
            
            //console.log(util.inspect(contributions, false, null, true /* enable colors */))
            
            
            for (var rss in contributions) {
                csvstring += "\r\n";
                csvstring += "\r\n";
                csvstring += "\r\n";
                csvstring += rss.charAt(0).toUpperCase() + rss.slice(1) + "\r\n";
                
                for (var player in contributions[rss].collected) {
                    csvstring += player + "," + contributions[rss].collected[player].join(",") + "\r\n";
                }
                
                csvstring += "\r\n";
                csvstring += "\r\n";
                csvstring += "Rejected \r\n";
                
                contributions[rss].rejected.forEach( (line) => {
                    csvstring += line + "\r\n";
                });
                
                csvstring += "\r\n";
            }
            
            console.log(csvstring);
            
            fs.writeFile("test.csv", csvstring, function(err) { 
                if(err) {
                    return console.log(err);
                }
                console.log("The file was saved!");
            }); 

        }
    });
}

/*
tesseract
    .recognize("Screenshot_20240218-110450_Total Battle.png", tesseractConfig)
    .then((text) => {
        let collected = [];
        let rejected = [];
        
        text.split("\r\n").forEach( (ele, idx, src) => {
            let found = ele.match(/([^a-z0-9]*?)(([a-z0-9\s])+?)sent resources\.(.+?)(\+*?)([0-9,]+)(.+?)/i);
            if (found === null) {
                if (ele.trim() == "") {
                    //console.error("Null");
                } else {
                    //console.warn("Rejected", ele);
                    //rejected.push(ele);
                    contributions[type].rejected.push(ele);
                }
            } else {
                //console.log(found[2].trim(), found[6].replace(/,/g, '').trim());
                //collected.push([found[2].trim(), found[6].replace(/,/g, '').trim()]);
                contributions[type].collected.push([found[2].trim(), found[6].replace(/,/g, '').trim()]);
            }
        });
        
        //console.log(rejected, collected);
    })
    .catch((error) => {
        console.log(error.message)
    })
    
*/