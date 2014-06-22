exports.action = function(data, callback, config, SARAH){

	var fs   = require('fs');
	var xmldoc = require('./lib/xmldoc');
	config = config.modules.xibase;
	var url="";
	var lan_path = '/cgi-bin/domo.cgi';
	var web_path='/m/zapi_remote_zibase_set.php';
	var sensors_path='/sensors.xml';
	var http = 'http://';
	var https = 'https://';
	var addr_telec;
	var actionType;
	var url_telec;
	var device_URL;
	
		
/************************************************* 
*************** BUILD URL ************************
**************************************************/	
/**** VERIF DES PARAMETRES ***/
console.log("xibase");

if (!config.API_Version || !config.ip_lan || !config.device || !config.token || !config.plateforme_web) {
		console.log("Les paramètres Xibase ne sont pas complets.");
		return;
}
/*****************************/
/***** ETUDE DES ACTIONS *****/
/*****************************/

/**** MISE A JOUR AUTOMATIQUE DES PERIHPERIQUES ****/
if (data.actionModule == "UPDATE") {
	if (!config.API_Version) {
		console.log("Api_version missing");
		return;
		}
	
	if (config.API_Version == 1) {
		console.log("Api_version 1");
		device_URL="http://" + config.plateforme_web + "/m/get_xml.php?device=" + config.device + "&token=" + config.token;
	}
 	// Send Request
	var request = require('request');
	request({ 'uri' : device_URL }, function (err, response, body){
		var tts=data.ttsAction;

	// Retour uniquement en config web
	if(config.acces_method == "web") {
		if (err || response.statusCode != 200) {
			callback({'tts': "L'action a échoué"});
			return;
		}
	}
	
	var results = new xmldoc.XmlDocument(body);
		var file = __dirname + '/xibase.xml';
		var xml  = fs.readFileSync(file,'utf8');
		var replace  = '§ -->\n';
		/****** recuperation des modules ***/
		var evs = results.childrenNamed("e");
	//	var ev = evs.childWithAttribute('id',module.attr.addr);
	//	var ttsEnd = "";
	var tts = "LEs paramètres on bien été importés. Voici les commandes possible. ";
		
		for (i = 0; i < evs.length; i++) { 
			var t=evs[i].attr.t;
			if (t=="COMMANDE2") {
					var typeaction="telecommande";
					var adresse1=evs[i].attr.c1;
					var adresse2=evs[i].attr.c2;
					var nom=evs[i].childNamed("n").val;
					tts += nom + " qui est une télécommande.  "
					 replace += '      <item>'+ nom +'<tag>out.action.ttsName="'+nom+'";out.action.typeAction="'+typeaction+'";out.action.bouton1="'+adresse1+'";out.action.bouton2="'+adresse2+'";</tag></item>\n';
			}
			if (t=="receiverXDom") {
					var typeaction="actionneur";
					var adresse=evs[i].attr.c;
					var protocol=evs[i].attr.p;
					var nom=evs[i].childNamed("n").val;
					tts += nom + " qui est un actionneur.  "
					 replace += '      <item>'+ nom +'<tag>out.action.ttsName="'+nom+'";out.action.typeAction="'+typeaction+'";out.action.adresse="'+adresse+'";out.action.protocol="'+protocol+'";</tag></item>\n';
			}
			if (t=="temperature") {
					var typeaction="sonde";
					var typesonde="temperature";
					var adresse=evs[i].attr.c;
					var nom="la température dans " + evs[i].childNamed("n").val;
					tts += nom + " qui est une sonde de température.  "
					 replace += '      <item>'+ nom +'<tag>out.action.ttsName="'+evs[i].childNamed("n").val+'";out.action.typeSonde="'+typesonde+'";out.action.typeAction="'+typeaction+'";out.action.adresse="'+adresse.replace('OS','')+'";</tag></item>\n';
			}
			if (t=="light") {
					var typeaction="sonde";
					var typesonde="luminosite";
					var adresse=evs[i].attr.c;
					var nom="la luminosité dans " + evs[i].childNamed("n").val;
					tts += nom + " qui est une sonde de luminosité.  "
					 replace += '      <item>'+ nom +'<tag>out.action.ttsName="'+evs[i].childNamed("n").val+'";out.action.typeSonde="'+typesonde+'";out.action.typeAction="'+typeaction+'";out.action.adresse="'+adresse.replace('OS','')+'";</tag></item>\n';
			}
		}
		/**** recuperation des scenarios ***/
		var evs = results.childrenNamed("m");
		
		for (i = 0; i < evs.length; i++) { 
			var id=evs[i].attr.id;
			var nom=evs[i].childNamed("n").val;
					tts += nom + " qui est un scénario.  "
			replace += '      <item>'+ nom +'<tag>out.action.ttsName="'+nom+'";out.action.typeAction="MACRO";out.action.idMacro="'+id+'";</tag></item>\n';
		}

		 replace += '<!-- §';      
  var regexp = new RegExp('§[^§]+§','gm');
  var xml    = xml.replace(regexp,replace);
  fs.writeFileSync(file, xml, 'utf8');
	console.log("tts " + tts);
	callback({'tts': tts});

	});
	//var tts=data.ttsAction;
}
else 
{


/**** MISE A JOUR AUTOMATIQUE DES PERIHPERIQUES ****/


/************* Action ***/
if (data.actionModule == "ON" || data.actionModule == "OFF") {
	url="http://" + config.ip_lan+lan_path;
	if (data.typeAction=="actionneur") {
			// Dimmable action
			if (data.dimValue){
				url += '?cmd=DIM%20'+data.adresse+'%20P'+data.protocol;
				url += '%20'+data.dimValue;
			}
			// ON/OFF action
			else { 
				url += '?cmd='+data.actionModule+'%20'+data.adresse+'%20P'+data.protocol;
			}
			}
	else if (data.typeAction=="telecommande") {
			if (data.actionModule == "ON") {
			url += '?cmd=sev%202%20'+data.bouton1;
			}
			else {
			url += '?cmd=sev%202%20'+data.bouton2;
			}	
	}
	else {
		callback({'tts': "je ne peux allumer ou éteindre qu'un actionneur ou une télécommande"});
	}
}
/*********** Scenario **/
else if (data.actionModule == "MACRO") {
	if (data.typeAction != "MACRO") {
		callback({'tts': "ceci n'est pas un scénario"});
		return;
	}
			url = http+config.ip_lan+lan_path;
			url += '?cmd=LM%20'+data.idMacro;
}
/******* sonde **/
else if (data.actionModule == "SONDE") {
	if (data.typeAction != "sonde") {
		callback({'tts': "ceci n'est pas une sonde"});
		return;
	}			url = http+config.ip_lan+sensors_path;
}

		console.log("Sending request to: " + url);
//		callback({'tts': tts});



	
/************************************************ 
*************** CALL URL ************************
*************************************************/		
  
 	// Send Request
	var request = require('request');
	request({ 'uri' : url }, function (err, response, body){
	
	// Retour uniquement en config web
	if(config.acces_method == "web") {
		if (err || response.statusCode != 200) {
			callback({'tts': "L'action a échoué"});
			return;
		}
	}
	
	// Sensors action => Parsing XML
	if (data.typeAction == 'sonde') {
		var results = new xmldoc.XmlDocument(body);
		var evs = results.childNamed("evs");
		var ev = evs.childWithAttribute('id',data.adresse);
		console.log("sonde : " + ev);
		var ttsEnd = "";
		var sonde;
		if (data.typeSonde == 'luminosite') {
			var sonde = ev.attr.v1;
			tts = "La luminosité de " + data.ttsName + " est de %s lux";

		}
		if (data.typeSonde == 'temperature') {
			var sonde = ev.attr.v1;
			sonde = RoundTo2Decimals(parseFloat(sonde)/10);
			tts = "La température de " + data.ttsName + " est de %s degrés";

		}	
		
		ttsEnd = parseFloat(sonde).toString().replace("."," virgule ");
		console.log("valeur : " + sonde);
		
//		tts = "La température de " + data.ttsName + " est de %s degrés";
		tts = tts.replace('%s', ttsEnd);
		console.log("valeur : " + ttsEnd);
	}
	
    else {
		var tts = data.ttsAction + " " + data.ttsName;
		if (data.ttsDim){
			tts += " " + data.ttsDim;
		}
		console.log("oups");
	}
	// Callback with TTS
	callback({'tts': tts});
	});
	}
}

function FormatNumberLength(num, length) {
    var r = "" + num;
    while (r.length < length) {
        r = "0" + r;
    }
    return r;
}

function RoundTo2Decimals(numberToRound) {
  return Math.round(numberToRound * 100) / 100
}