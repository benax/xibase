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

if (!config.ip_lan || !config.device || !config.token || !config.plateforme_web) {
		callback({'tts': "Les paramètres Xibase ne sont pas complets."});
		return;
}
/*****************************/
/***** ETUDE DES ACTIONS *****/
/*****************************/
	var api2_path='https://'+ config.plateforme_web + '/api/get/ZAPI.php?zibase=' + config.device + '&token=' + config.token;


/**** MISE A JOUR AUTOMATIQUE DES PERIHPERIQUES ****/
if (data.actionModule == "UPDATE") {
		
		console.log("Api_version 2");
		device_URL=api2_path + "&service=get&target=home";
		console.log("device_url : " + device_URL);

 	// Send Request
	var request = require('request');
	request({ 'uri' : device_URL, 'json' : true }, function (err, response, body){
		var tts=data.ttsAction;

	// Retour uniquement en config web
	if(config.acces_method == "web") {
		if (err || response.statusCode != 200) {
			callback({'tts': "L'action a échoué"});
			return;
		}
	}
		var file = __dirname + '/xibase.xml';
		var xml  = fs.readFileSync(file,'utf8');
		var replace  = '§ -->\n';
	var tts = "LEs paramètres on bien été importés. Voici les commandes possible. ";

		/***** actionneurs ***/
	var results=body.body.actuators;
	for (i = 0; i < results.length; i++) {
			var typeaction="actionneur";
			var adresse=results[i].id;
			var protocol=results[i].protocol;
			var nom=results[i].name;
			/********* ajour des articles pour les peripheriques le splus connus*****/
			var commande=replaceAll(nom,"lumiere","lumière");
			commande=replaceAll(commande,"lumière","la lumière");
			commande=replaceAll(commande,"lampe","la lampe");
			commande=replaceAll(commande,"volet","le volet");
			commande=replaceAll(commande,"radiateur","le radiateur");
			commande=replaceAll(commande,"chauffage","le chauffage");
			commande=replaceAll(commande,"alarme","l'alarme");
			commande=replaceAll(commande,"portail","le portail");
			commande=replaceAll(commande,"chevet","le chevet");
			commande=replaceAll(commande,"plafonnier","le plafonnier");
			commande=replaceAll(commande,"VMC","la VMC");
			commande=replaceAll(commande,"ventilation","la ventilation");
			commande=replaceAll(commande,"chaudiere","chaudière");
			commande=replaceAll(commande,"chaudière","la chaudière");
			commande=replaceAll(commande,"sdb","salle de bain");
			commande=preposition(commande);
			tts += commande + " qui est un actionneur.  "
			
			 replace += '      <item>'+ commande +'<tag>out.action.ttsName="'+commande+'";out.action.typeAction="'+typeaction+'";out.action.adresse="'+adresse+'";out.action.protocol="'+protocol+'";</tag></item>\n';
	}
		/***** telecommandes ***/
	var results=body.body.remotes;
	for (i = 0; i < results.length; i++) {
			var typeaction="telecommande";
			var adresse1=results[i].idON;
			var adresse2=results[i].idOFF;
			var nom=results[i].name;
			tts += nom + " qui est une télécommande.  "
			 replace += '      <item>'+ nom +'<tag>out.action.ttsName="'+nom+'";out.action.typeAction="'+typeaction+'";out.action.bouton1="'+adresse1+'";out.action.bouton2="'+adresse2+'";</tag></item>\n';
	}
		/***** sondes ***/
	var results=body.body.probes;
	for (i = 0; i < results.length; i++) {
		if (results[i].type=="temperature") {
				var typeaction="sonde";
				var typesonde="temperature";
				var adresse=results[i].id;
				var nom="la température dans " + results[i].name;
				nom=article_sonde(nom);
				tts += nom + " qui est une sonde de température.  "
				 replace += '      <item>'+ nom +'<tag>out.action.ttsName="'+results[i].name+'";out.action.typeSonde="'+typesonde+'";out.action.typeAction="'+typeaction+'";out.action.adresse="'+adresse+'";</tag></item>\n';
				var typeaction="sonde";
				var typesonde="hydro";
				var adresse=results[i].id;
				var nom="l'hygrométrie dans " + results[i].name;
				nom=article_sonde(nom);
				tts += nom + " qui est une sonde de d'hygrométrie.  "
				 replace += '      <item>'+ nom +'<tag>out.action.ttsName="'+results[i].name+'";out.action.typeSonde="'+typesonde+'";out.action.typeAction="'+typeaction+'";out.action.adresse="'+adresse+'";</tag></item>\n';
			 }
		if (results[i].type=="light") {
				var typeaction="sonde";
				var typesonde="luminosite";
				var adresse=results[i].id;
				var nom="la luminosité dans " + results[i].name;
				nom=article_sonde(nom);
				tts += nom + " qui est une sonde de luminosité.  "
				 replace += '      <item>'+ nom +'<tag>out.action.ttsName="'+results[i].name+'";out.action.typeSonde="'+typesonde+'";out.action.typeAction="'+typeaction+'";out.action.adresse="'+adresse+'";</tag></item>\n';
			 }
	}
		/***** scenarios ***/
	var results=body.body.scenarios;
	for (i = 0; i < results.length; i++) {
			var id=results[i].id;
			var nom=results[i].name;
					tts += nom + " qui est un scénario.  "
			replace += '      <item>'+ nom +'<tag>out.action.ttsName="'+nom+'";out.action.typeAction="MACRO";out.action.idMacro="'+id+'";</tag></item>\n';
	}
			 replace += '<!-- §';   
		 
  var regexp = new RegExp('§[^§]+§','gm');
  var xml    = xml.replace(regexp,replace);
  fs.writeFileSync(file, xml, 'utf8');
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
	}			
	url = api2_path + "&service=get&target=probe&id=" + data.adresse;
}

		console.log("Sending request to: " + url);
//		callback({'tts': tts});



	
/************************************************ 
*************** CALL URL ************************
*************************************************/		
  
 	// Send Request
	var request = require('request');
	request({ 'uri' : url, 'json' : true  }, function (err, response, body){
	
	// Retour uniquement en config web
	if(config.acces_method == "web") {
		if (err || response.statusCode != 200) {
			callback({'tts': "L'action a échoué"});
			return;
		}
	}
	
	// Sensors action => Parsing JSON
	if (data.typeAction == 'sonde') {
		var ttsEnd = "";
		var sonde;
		if (data.typeSonde == 'luminosite') {
			var sonde = body.body.val1;
			tts = "La luminosité de " + data.ttsName + " est de %s lux";

		}
		if (data.typeSonde == 'temperature') {
			var sonde = body.body.val1;
			console.log("sonde : " + sonde);
			//sonde = RoundTo2Decimals(parseFloat(sonde)/10);
			tts = "La température de " + data.ttsName + " est de %s degrés";

		}	
		if (data.typeSonde == 'hydro') {
			var sonde = body.body.val2;
			tts = "L'hygrométrie de " + data.ttsName + " est de %s pourcents";

		}	
		
		ttsEnd = parseFloat(sonde).toString().replace("."," virgule ");
		
		tts = tts.replace('%s', ttsEnd);
	}
	
    else {
		var tts = data.ttsAction + " " + data.ttsName;
		if (data.ttsDim){
			tts += " " + data.ttsDim;
		}
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

function preposition(nom) {
	var result=replaceAll(nom,"cuisine","de la cuisine");
	result=replaceAll(result,"salon","du salon");
	result=replaceAll(result,"salle à manger","de la salle à manger");
	result=replaceAll(result,"billard","du billard");
	result=replaceAll(result,"salle de bain","de la salle de bain");
	result=replaceAll(result,"chambre","de la chambre");
	return result;
	
}

function article_sonde(nom) {
	var commande=replaceAll(nom,"temp ","");
	commande=replaceAll(commande,"light ","");
	commande=replaceAll(commande,"chambre","la chambre");
	commande=replaceAll(commande,"salon","le salon");
	commande=replaceAll(commande,"salle à manger","la salle à manger");
	commande=replaceAll(commande,"salle a manger","la salle à manger");
	commande=replaceAll(commande,"cuisine","la cuisine");
	commande=replaceAll(commande,"SDB","salle de bain");
	commande=replaceAll(commande,"salle de bain","la salle de bain");
	return commande;
	}
	
function replaceAll(origin,searchMask,replaceMask) {
	var regEx = new RegExp(searchMask, "ig");
	var result = origin.replace(regEx, replaceMask);
	return result;
}