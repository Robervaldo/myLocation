function getLocation(){
	var i;
	for(i = 0;  i < 5; i++){
		if (navigator.geolocation){
			navigator.geolocation.getCurrentPosition(showPosition, showError);
		}else{
			msg.innerHTML = "This browser not supported geolocation.";
		}
	}
	count = 0;
}

function showPosition(position){
	count++;
	lat = position.coords.latitude;
	lon = position.coords.longitude;
	
	loc.innerHTML = "Latitude: " + lat + "<br /> Longitude: " + lon;
	
	dtInicio = new Date();
	dti.innerHTML = "Hora Inicial: "+dtInicio.getHours()+":"+dtInicio.getMinutes()+":"+dtInicio.getSeconds()+":"+dtInicio.getMilliseconds();
	
	onInit();
	
	if(count == 5){
		selectBanco();
		selectResult();
	}
	
}

function showError(error){
	switch(error.code){
		case error.PERMISSION_DENIED:
			msg.innerHTML = "User denied the request for Geolocation."
			break;
		case error.POSITION_UNAVAILABLE:
			msg.innerHTML = "Location information is unavailable."
			break;
		case error.TIMEOUT:
			msg.innerHTML = "The request to get user location timed out."
			break;
		case error.UNKNOWN_ERROR:
			msg.innerHTML = "An unknown error occurred."
			break;
	}
}

function onInit() {
	try {
		if (!window.openDatabase) {
			alert("Erro: Seu navegador não permite banco de dados.");
		} else {
			initDB();
			createTables();
			onCreate();
		}
	} catch (e) {
		if (e == 2) {
			alert("Erro: Versão de banco de dados inválida.");
		} else {
			alert("Erro: Erro desconhecido: " + e + ".");
		}
		return;
	}
}

function initDB() {
	var shortName = 'locationDB';
	var version = '1.0';
	var displayName = 'MyLocationDB';
	var maxSize = 65536; // Em bytes
	localDB = window.openDatabase(shortName, version, displayName, maxSize);
}

function createTables() {
	var query = 'CREATE TABLE IF NOT EXISTS location(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, lat VARCHAR NOT NULL, lon VARCHAR NOT NULL, dtInicio VARCHAR NOT NULL, dtFim VARCHAR NOT NULL, time INTEGER NOT NULL);';
	try {
		localDB.transaction(function (transaction) {
			transaction.executeSql(query, [], nullDataHandler, errorHandler);
			//alert("Tabela 'location' status: OK.");
		});
	} catch (e) {
		alert("Erro: Data base 'location' não criada " + e + ".");
		return;
	}
}

function onCreate() {
	var lat = this.lat;
	var lon = this.lon;
	var dtInicio = this.dtInicio;
	var dtFinal = new Date();
	var dtInicioFormatada = dtInicio.getHours()+":"+dtInicio.getMinutes()+":"+dtInicio.getSeconds()+":"+dtInicio.getMilliseconds();
	var dtFimFormatada = dtFinal.getHours()+":"+dtFinal.getMinutes()+":"+dtFinal.getSeconds()+":"+dtFinal.getMilliseconds();
	
	var time = dtFinal.getTime()-dtInicio.getTime();
	
	//alert(time);
	
	dtf.innerHTML = "Hora Final: "+dtFimFormatada;
	
	var query = "insert into location(lat, lon, dtInicio, dtFim, time) VALUES (?, ?, ?, ?, ?);";
	try {
		localDB.transaction(function (transaction) {
			transaction.executeSql(query, [lat, lon, dtInicioFormatada, dtFimFormatada, time], function (transaction, results) {
				if (!results.rowsAffected) {
					alert("Erro: Inserção não realizada");
				} else {
					//alert("Inserção realizada com sucesso! Id: " + results.insertId);
					//alert(i);
					this.lat = null;
					this.lon = null;
					this.dtInicioFormatada = null;
					
				}
			}, function (transaction, error) {
				alert("Error in insert: " + error.code + " Message: " + error.message);
			});
		});
	} catch (e) {
		alert("Erro: INSERT não realizado " + e + ".");
	}
}

function onDrop() {
	initDB();
	var query = "drop table location;";
	try {
		localDB.transaction(function (transaction) {
			transaction.executeSql(query, [], function (transaction, results) {
				selectBanco();
				loc.innerHTML = "";
				msg.innerHTML = "";
				dti.innerHTML = "";
				dtf.innerHTML = "";
				med.innerHTML = "";
				//alert("Tabela limpa!");
			});
		});
	} catch (e) {
		alert("Erro: DROP não realizado " + e + ".");
	}
}

function selectBanco() {
	var dataRows = document.getElementById("itemData").getElementsByClassName("data");
	while (dataRows.length > 0) {
		row = dataRows[0];
		document.getElementById("itemData").removeChild(row);
	};
	var query = "SELECT * FROM location;";
	try {
		localDB.transaction(function (transaction) {
			transaction.executeSql(query, [], function (transaction, results) {
				for (var i = 0; i < results.rows.length; i++) {
					var row = results.rows.item(i);
					var li = document.createElement("li");
					li.setAttribute("id", row['id']);
					li.setAttribute("class", "data");
					//li.setAttribute("style", "valign:left");
					var liText = document.createTextNode(row['id'] + " | " + row['lon'] + " | " + row['lat'] + " | " + row['dtInicio'] + " | " + row['dtFim'] + " | " + row['time']);
					li.appendChild(liText);
					document.getElementById("itemData").appendChild(li);
				}
			}, function (transaction, error) {
				//alert("Error in select: " + error.code + " Mensagem: " + error.message);
			});
		});
	} catch (e) {
		alert("Error: SELECT nã o realizado " + e + ".");
	}
}

function selectResult() {
	var query = "SELECT * FROM location;";	
	var resultBanco = null;
	try {
		localDB.transaction(function (transaction) {
			transaction.executeSql(query, [], function (transaction, results) {
				for (var i = 0; i < results.rows.length; i++) {
					var row = results.rows.item(i);
					resultBanco = resultBanco+row['time'];
				}
				med.innerHTML = "M&eacute;dia: "+resultBanco/results.rows.length+" milisegundos";
			}, function (transaction, error) {
				//alert("Error in select: " + error.code + " Mensagem: " + error.message);
			});
		});
	} catch (e) {
		alert("Error: SELECT não realizado " + e + ".");
	}
}

errorHandler = function(transaction, error){
	alert("Erro: " + error.message); 
	return true;
}  

nullDataHandler = function(transaction, results){}