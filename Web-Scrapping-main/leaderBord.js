const request=require("request");
const jsdom=require("jsdom");
const{JSDOM}=jsdom;
const fs=require("fs");
const xlsx = require("json-as-xlsx")
const link='https://www.espncricinfo.com/series/ipl-2021-1249214/match-results';
let leaderboard = [];
let counter=0;

request(link,cb);

function cb(error,response,html){
    if(error){
        console.log(error);

    }
    else{
        const dom=new JSDOM(html);
        const document=dom.window.document;
        let allScorecardTags = document.querySelectorAll('.ds-border-b.ds-border-line');
        for(let i=0;i<60;i++){
            let anchorTagAll = allScorecardTags[i].querySelectorAll("a");
            let link = anchorTagAll[2].href;
            let completeLink="https://www.espncricinfo.com"+link;
          // console.log(completeLink);
            request(completeLink,cb2);
            counter++;

        }
    }
}



//console.log(leaderboard);

function cb2(error,response,html){
    if(error){
        console.log(error);
    }else{
        const dom=new JSDOM(html);
        const document=dom.window.document;
        let batsmenRow=document.querySelectorAll('tbody [class="ds-border-b ds-border-line ds-text-tight-s"]');
        for(let i=0;i<batsmenRow.length;i++){
            let cell=batsmenRow[i].querySelectorAll("td");
            if(cell.length==8){
                let Name=cell[0].textContent;
                let Runs=cell[2].textContent;
                let balls=cell[3].textContent;
                let Fours=cell[5].textContent;
                let Sixes=cell[6].textContent;
               // console.log("Name: ",Name,"Runs :",Runs,"Balls :",balls,"Fours :",Fours,"Sixes :",Sixes);
               processPlayer(Name,Runs,balls,Fours,Sixes);
    
            }
        }
        counter--;

        
        if(counter==0){
            console.log(leaderboard);
            let data = JSON.stringify(leaderboard);
            fs.writeFileSync('BatsmenStats.json',data);
            let dataExcel = [
                {
                    sheet: "Ipl Stats",
                    columns: [
                        { label: "Name", value: "Name" }, // Top level data
                        { label: "Innings", value: "Innings" },
                        { label: "Runs", value: "Runs" }, // Custom format
                        { label: "Balls", value: "Balls" }, // Run functions
                        { label: "Fours", value: "Fours" },
                        { label: "Sixes", value: "Sixes" },
                    ],
                    content: leaderboard
                    //[{Name:"Rahul",Innings:16,Runs:422,Balls......}]
                },
            ]

            let settings = {
                fileName: "BatsmenDetail", // Name of the resulting spreadsheet
                extraLength: 3, // A bigger number means that columns will be wider
                writeOptions: {}, // Style options from https://github.com/SheetJS/sheetjs#writing-options
            }
            xlsx(dataExcel, settings) // Will download the excel file
     
        }
            

    }
}
function processPlayer(Name,Runs,balls,Fours,Sixes){
    Runs=Number(Runs);
    balls = Number(balls);
    Fours = Number(Fours);
    Sixes = Number(Sixes);
    for(let i=0;i<leaderboard.length;i++){
        let playerObj = leaderboard[i];
        if(playerObj.Name == Name){
            //will do some work here
            playerObj.Runs+=Runs;
            playerObj.Innings+=1;
            playerObj.balls+=balls;
            playerObj.Fours+=Fours;
            playerObj.Sixes+=Sixes;
            return;
        }


    }
    // code coming here means we did not find our player inside leaderboard
    let obj = {
        Name:Name,
        Innings:1,
        Runs:Runs,
        Balls:balls,
        Fours:Fours,
        Sixes:Sixes
    }
    leaderboard.push(obj);
}
    


