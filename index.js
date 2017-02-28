
const Rx = require('rx');
var Gloves={};
function mqttSource(){
    const MQTT = require('mqtt');
    const client  = MQTT.connect('mqtt://localhost')

    client.on('connect', ()=> {client.subscribe('glove/touch/event')})
    client.on('error',(e)=>{`${e} and mqtt error!`});
    return {source:client,onevent:"message",type:'mqtt'};
}


function hostPortSource(){
    const net = require('net');
    const readline = require('readline');
    const localClient = net.connect({host:"192.168.44.136",port: 3002}, () => {});
    localClient.on('error',function(e){console.log(`${e} and host port is not opened`);});
    const  rl = readline.createInterface({input:localClient, output:localClient});
    return {source:rl,onevent:"line",type:'hostport'};
}
/**
 * buildSource
 */
function buildSource(opts){
    let watchSource=process.argv[2] !='mqtt'? hostPortSource():mqttSource();
    const source=Rx.Observable
        .fromEvent(watchSource['source'],watchSource['onevent'],(t,m)=>{
            if(watchSource['type']=='mqtt'){
                return { topic: t, message: m ,type:watchSource['type']};
            }else{
                return { topic: "glove/touch/event", message: t ,type:watchSource['type']};
            }
        }).share();
    return source;
}
const source=buildSource()
const createOnclickStream=(keyCode)=>{
    return { key:keyCode,
             stream:source
            .filter((topicAndMessagePair)=>{
                const m=topicAndMessagePair.message.split(',')
                return m[6]==keyCode && (m[3]==true)
            })
            .map((topicAndMessagePair)=>{
                return topicAndMessagePair.message
            })}}
/**
 *  长按
 */
const createOnLongPushStream=(keyCode,seconds)=>{
    return {    key:keyCode,
                stream:createOnclickStream(keyCode).stream
                .bufferWithTime(seconds*1000)
                .filter(x=>x.length>=2)
                // .takeLastWithTime(seconds*1000)
    }
}
/**
 * keyCode array ,please.
 * 同时按下
 */
const createOnBothClickStream=(keyCodes,period) =>{
    const x=keyCodes.map((x,i)=>createOnclickStream(x)).map((x,i)=>x.stream)
    return x.reduce((x,y)=>{return x.combineLatest(y)}).filter((msgseq)=>{
        const m0=msgseq[0].split(",")
        const m1=msgseq[1].split(",")
        return Math.abs(m0[4]-m1[4])<(period||50);
    }).map((msgseq)=>{
        const m0=msgseq[0].split(",")
        const m1=msgseq[1].split(",")
        return {keys:[m0[6],m1[6]]  ,time:m0[4]}
    })
}

const fiveGods ="紫薇我爱你"
const PORT={2:0,3:1,4:2,5:3,6:4}
source.subscribe(
    (x)=> {
        const m=x.message.split(",")
        // console.log(m)  ==>[ '1', 'Continue', '801', '0', '418233', '6', 'Ni' ]
        const whatIsay=fiveGods[PORT[m[5]]]
        // console.info(`${whatIsay} ${m[6]}`);
        },
    (err)=> { console.log('Error: ' + err); },
    () =>{ console.log('Completed'); })


/**
 *  
 */
function demo(){
    createOnclickStream('We').stream.subscribe((x)=>{  console.log(`${x} onclick`)})
// createOnLongPushStream('We',1.5).stream.subscribe((x)=>{  console.log(`${JSON.stringify(x)} ---------long push`)
                // ,(e)=>{console.log(e)}
                // ,(c)=>{console.log("Completed")}})
    createOnBothClickStream(["Zi","We"]).subscribe((x)=>{
        console.log(`${JSON.stringify(x)} ---------both click`)
    });

};



Gloves.createOnclickStream=createOnclickStream
Gloves.createOnBothClickStream=createOnBothClickStream
Gloves.createOnLongPushStream=createOnLongPushStream
Gloves.fiveGods=fiveGods
Gloves.fiveKeys=['Zi','We','Wo','Ai','Ni']
module.exports=Gloves