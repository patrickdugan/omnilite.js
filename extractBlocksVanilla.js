const litecoin = require('litecoin');
const fs = require('fs');
const json = require('big-json');
const blockData = [];
var chainHeight = 0
var protocolBlocks=[{height:0,omTx:[],tlTx:[]}]
var txIndexomni=[]
var indexPlaceholder = 0
var thisBlockOm = []
var thisBlockTl = []
var omniTxCount = 0

const client = new litecoin.Client({
    host: 'localhost',
    port: 9332,
    user: 'user1589AisO',
    pass: 'pass66516aEfA',
    timeout: 10000
});

function decodeOPReturnPayload(hexPayload) {
  // Decode the payload and return the decoded data
  // ...

  // Example code
  const decodedData = Buffer.from(hexPayload, 'hex').toString('utf8');
  return decodedData;
}

function extractBlockData(startHeight) {
  client.getBlockCount(function (error, chainTip) {
    if (error) {
      console.error('Error retrieving chain tip:', error);
      return;
    }else{chainHeight=chainTip}

    getBlockData(startHeight);
  });
}



function getBlockData(height) {
  console.log(height)
    client.getBlockHash(height, function (error, blockHash) {
      if (error) {
        console.error('Error retrieving block hash:', error);
        return;
      }

      client.getBlock(blockHash, function (error, currentBlock) {
        if (error) {
          console.error('Error retrieving block data:', error);
          return;
        }

        blockData.push(currentBlock);

        if (currentBlock.height === startHeight+3) {
          console.log('Block data extraction completed.');
          extractProtocolTx(startHeight,false)
        } else {
          getBlockData(height + 1);
        }
      });
    });
  }

function makeFile(filename, pojo){

    const stringifyStream = json.createStringifyStream({
        body: pojo
    });

    stringifyStream.on('data', function(strChunk) {
        fs.appendFile(filename, strChunk, function (err) {
            if (err) throw err;
        })
    });

}

// Example usage
const startHeight = 2098224;
extractBlockData(startHeight);

function extractProtocolTx(start,finishBlock){
  //console.log(blockData)
  if(finishBlock==true){
      if(protocolBlocks.omTx!=[]||tlTx!=[]){
        protocolBlocks.push({height:start,omTx:thisBlockOm,tlTX:thisBlockTl})
        thisBlockOm=[]
        thisBlockTl=[]
      }     
  }
  indexPlaceholder=start
  var placement = start-startHeight
  console.log(placement,start)
  var thisBlock = blockData[placement]
  /*try{
    if(thisBlock.tx.length=undefined){thisBlock=blockData[placement+1]}else{indexPlaceholder=start}
  }catch{
    console.log('block is apparently undefined')
  }*/

  if(start>=startHeight+2){
     var obj = JSON.stringify(protocolBlocks)
      makeFile('protocolTxIndex.json',protocolBlocks)
      console.log("ta da!!")
      return true
  }
  loopThroughBlock(thisBlock,0)
}

function loopThroughBlock(block,i) {
  if(block!=undefined){
    console.log(block.height, i, block.tx.length);
  }else{extractProtocolTx(null,true) }

  if (block === undefined) {
    console.log("Jim, abort! Block undefined");
    return extractProtocolTx(indexPlaceholder+1,true)
  }else if(i>=block.tx.length){
    console.log("Jim, abort! i>tx.length block done!");
    return extractProtocolTx(block.height+1,true)
  }

  var tx = block.tx[i];
    
      if (tx === undefined || tx === '') {
        console.log("Jim, abort!");
        return loopThroughBlock(block,i+1)
      }

  try{
    //console.log(tx);
    client.getRawTransaction(tx,true,function(err,rawtx){      
        
        if (rawtx === undefined) {
          return loopThroughBlock(block, i + 1);
        }

        let confirmations;
        try {
          confirmations = rawtx.confirmations;
        } catch {
          return loopThroughBlock(block, i + 1);
        }

        var thisConfirmations = confirmations;

        for (let v = 0; v < rawtx.vout.length; v++) {
          //console.log(v)
          var vout = rawtx.vout[v];
          var ASMstring = vout.scriptPubKey.asm.slice(0,9);
          //console.log(ASMstring)
          if (ASMstring === "OP_RETURN" && confirmations >= 1) {

            var payload = vout.scriptPubKey.asm.slice(11,vout.scriptPubKey.asm.length);
            //console.log(payload)           
            var marker =separateMarker(payload)

            var txObj = { tx: tx, payload: payload, marker: marker };
            console.log(decodedPayload,marker,txObj)
            if (marker === "om") {
              marker = payload.slice(0,3)
              txObj.marker=marker
              payload=payload.slice(4,payload.length)
              txObj.payload=payload
              omniTxCount+=1
              console.log("Omni tx "+omniTxCount)
              thisBlockOm.push(txObj);
            }
            if (marker === "tl") {
              payload=payload.slice(2,payload.length)
              txObj.payload=payload
              thisBlockTl.push(txObj);
            }
          } else if (ASMstring === "OP_RETURN" && confirmations === 0) {
            var payload = vout.scriptPubKey.asm.split(' ');
            var decodedPayload = decodeOPReturnPayload(payload);
            var marker = decodedPayload.slice(0, 1);
            var txObj = { tx: tx, payload: payload, decode: decode, marker: marker };
            if (marker === "om" || marker === "tl") {
              memPool.push(tx);
            }
          }
        }
        return loopThroughBlock(block,i+1)
    })
  }catch{
        console.log("is rawtx undefined", rawtx);
  }
}



function decodeOmniPayload(hexPayload) {
  const marker = hexPayload.slice(0, 4);

  if (marker === '6f6d') {
    // Decode 'om' marker
    return "omni"
  } else if (marker === '746c') {
    // Decode 'tl' marker
    return "tl"
  } else {
    // Unknown marker
    return { error: 'Unknown marker' };
  }
}