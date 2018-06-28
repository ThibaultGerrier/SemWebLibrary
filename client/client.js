const request = require('request');
//const prompt = require('prompt');
const prompt = require("prompt-async");
prompt.start();
let url='http://localhost:3000';
let globalDescription;

let begin=()=>{
    console.log('Please enter the url, or leave empty for localhost');
    prompt.get(['url'], function (err, result) {
        if(result.url){
            url=result.url;
        }
        start();
    });
};
let start=()=>{
    request(url+'/api/vocab', function (error, response, body) {
        body=JSON.parse(body);
        globalDescription=body;

        console.log('Welcome to the '+body['@type']);
        console.log('You have these entry-points as choice:');
        let entrypoints=[];
        let link;
        let i=0;
        let num=getEntryNumber(body);
        body.supportedClass[num].supportedProperty.forEach(function(e){
            console.log(i+': '+e['hydra:title']+' - '+e['hydra:description']);
            entrypoints.push(e.property.supportedOperation);
            i++;
        });

        console.log('Please enter a number to choose one');
        prompt.get(['number'], function (err, result) {
            //console.log('  number: ' + result.number);
            link=body.supportedClass[num].supportedProperty[result.number].property['@id'];
            let actionsTodo=entrypoints[result.number];
            let j=0;
            console.log('You can do here: ');
            actionsTodo.forEach(function(a){
                console.log(j+': '+a.label);
                j++;
            });
            prompt.get(['number'], function (err, result) {
                let action=actionsTodo[result.number];
                performAction(action,link);
            });
        });
    });
};

let performAction = async (action,link)=>{
    console.log(link);
    if(action.expects){
        let body={};

        let supProp=getExpProp(action.expects);
        for(let p of supProp){
            console.log('Please enter '+p.property.label);
            let input = await prompt.get(['input']);
            body[p.property.label]=input.input;
        }
        console.log(body);
        callLink(link,body,action.method);
    }else{
        callLink(link,undefined,action.method);
    }
};

let callLink = (link,body,method)=>{
    let u=url+link.replace('vocab:EntryPoint','/api');
    request({
        url: u,
        method: method,
        json: true,
        body: body
    }, function (error, response, body){
        if(body['@type'].indexOf('Collection')!==-1){
            handleCollection(body);
        }else if(body['@type'].indexOf('Status')!==-1) {
            console.log(body);
            start();
        }else{
            console.log(body);
            let doable=[];
            for(let entry in body){
                if(entry==='@id'){
                    let temp={
                        link:body['@id'],
                        type:body['@type'],
                        operations:getExpActions(body['@type'])
                    };
                doable.push(temp);
                }else{
                    if(typeof body[entry]==='string' && body[entry].startsWith('/')){
                        let t=searchTypeByPropName(body['@type'],entry);
                        let temp={
                            type:entry,
                            link:body[entry],
                            operations:t
                        };
                        doable.push(temp);
                    }
                }
            }
            console.log('Choose with what you want to continue:');
            let k=0;
            doable.forEach(function(d){
               console.log(k+'.: '+d.type);
               k++;
            });
            prompt.get(['number'], function (err, result) {
                askForActions(doable[result.number].operations,doable[result.number].link);
            });
            //console.log(JSON.stringify(doable,null,2));
        }
    });
};

let getExpProp = (expects)=>{
    let result=null;
    globalDescription.supportedClass.forEach(function(c){
        if (expects.indexOf('vocab')===-1){
            expects='vocab:'+expects;
        }
        if (c['@id']===expects){
            result= c.supportedProperty;
        }
    });
    return result;
};

let getExpActions = (expects)=>{
    let result=null;
    globalDescription.supportedClass.forEach(function(c){
        if (expects.indexOf('vocab')===-1){
            expects='vocab:'+expects;
        }
        if (c['@id']===expects){
            result= c.supportedOperation;
        }
    });
    return result;
};

let handleCollection = (coll)=>{
    console.log('Here we found a '+coll['@type']+' with '+coll.members.length+' results');
    if(coll.members.length===0){
        start();
        return;
    }
    console.log(coll.members.map(function(m){return m['@id']}).join('\n'));
    console.log('Please choose one by entering its id');
    let type=coll.members[0]['@type'];
    prompt.get(['id'], function (err, result) {
        let link=result.id;
        if(link.indexOf('/')===-1){
            console.log('This is not an id, please try again!');
            handleCollection(coll)
        }else{
            let supActions=getExpActions(type);
            askForActions(supActions,link);
        }
    });

};

let askForActions = (actions,link)=>{
    let j=0;
    console.log('You can do here: ');
    actions.forEach(function(a){
        console.log(j+': '+a.label);
        j++;
    });
    prompt.get(['number'], function (err, result) {
        let action=actions[result.number];
        performAction(action,link);
    });
};

let searchTypeByPropName = (type, property)=>{
    let prop=getExpProp(type);
    let result;
    prop.forEach(function(p){
        if(p.property.label===property){
            result=p.property.supportedOperation;
        }
    });
    return result;
};

let getEntryNumber = (body)=>{
    let r=0;
    let result;
    body.supportedClass.forEach(function (e){
        if(e['@id'].indexOf('EntryPoint')!==-1){
            result=r;

        }
        r++;
    });
    return result;
};

begin();