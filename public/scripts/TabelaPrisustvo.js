let TabelaPrisustvo = function (divRef, dataMain) {
	let data = { property: dataMain };
	let modifyData = function (newData) {
		data.property = newData;
	};

	let staviPostotak = function (sedmica, data) {
		data = data["0"];
		for (let element of data.studenti) {
			let x = -1;
			for (let pris of data.prisustva) {
				if (pris.sedmica == sedmica && element.index == pris.index) {
					x = pris.predavanja + pris.vjezbe;
				}

			}


			let a = document.getElementById("r" + (data.studenti.indexOf(element) + 1) + "c" + sedmica).parentElement;
			let newCell = document.createElement("td");
			let text3 = document.createTextNode("");
			if (x != -1)
				text3 = document.createTextNode(Math.round(x * 10000 / (data.brojPredavanjaSedmicno + data.brojVjezbiSedmicno)) / 100 + "%");
			newCell.appendChild(text3);
			a.parentNode.replaceChild(newCell, a);
			newCell.id = "r" + (data.studenti.indexOf(element) + 1) + "c" + sedmica;



		}
	}

	let staviTablicu = function (sedmica, data) {
		data = data["0"];
		for (let element of data.studenti) {
			k = data.studenti.indexOf(element);
			let table2 = document.createElement("table");
			let row2 = table2.insertRow();
			for (let i = 0; i < data.brojPredavanjaSedmicno; i++) {
				let cell2 = row2.insertCell();
				let text2 = document.createTextNode("P" + (i + 1));
				cell2.appendChild(text2);
			}
			for (let i = 0; i < data.brojVjezbiSedmicno; i++) {
				let cell2 = row2.insertCell();
				let text2 = document.createTextNode("V" + (i + 1));
				cell2.appendChild(text2);
			}
			let row3 = table2.insertRow();
			row3.style.height = "30px";
			pp = -1;
			pv = -1;
			for (let x of data.prisustva) {
				if (x.index == element.index && x.sedmica == sedmica) {
					pp = x.predavanja;
					pv = x.vjezbe;
				}
			}

			for (let i = 0; i < data.brojPredavanjaSedmicno; i++) {
				let cell3 = row3.insertCell();
				if (i < pp)
					cell3.className = "zelena";
				else if (i >= pp && pp >= 0)
					cell3.className = "crvena";
				else
					cell3.className = "bijela";
				string = "pp" + pp;
				string2 = "pv" + pv;
				cell3.classList.add(string);
				cell3.classList.add(string2);
				cell3.addEventListener("click", function () {

					pp = parseInt(cell3.classList.item(1).slice(2));
					pv = parseInt(cell3.classList.item(2).slice(2));

					if (cell3.classList.contains("bijela")) {
						pp = 1;
						pv = 0;
					}
					else if (cell3.classList.contains("zelena")) {
						pp = pp - 1;

					}
					else if (cell3.classList.contains("crvena")) {
						pp = pp + 1;

					}
					h2 = document.getElementById("predmet").innerText;
					naziv = h2.substr(9);
					PoziviAjax.postPrisustvo(naziv, element.index, { "sedmica": sedmica, "predavanja": pp, "vjezbe": pv }, function (status, data) {

						if (status) {
							osvjeziTablicu(trenutnaSedmica, data);

						}


					});
				});
			}
			for (let i = 0; i < data.brojVjezbiSedmicno; i++) {
				let cell3 = row3.insertCell();
				if (i < pv)
					cell3.className = "zelena";
				else if (i >= pv && pv >= 0)
					cell3.className = "crvena";
				else
					cell3.className = "bijela";
				string = "pp" + pp;
				string2 = "pv" + pv;
				cell3.classList.add(string);
				cell3.classList.add(string2);
				cell3.addEventListener("click", function () {
					pp = parseInt(cell3.classList.item(1).slice(2));
					pv = parseInt(cell3.classList.item(2).slice(2));
					if (cell3.classList.contains("bijela")) {
						pv = 1;
						pp = 0;
					}
					else if (cell3.classList.contains("zelena")) {
						pv = pv - 1;
					}
					else if (cell3.classList.contains("crvena")) {
						pv = pv + 1;
					}
					h2 = document.getElementById("predmet").innerText;
					naziv = h2.substr(9);
					PoziviAjax.postPrisustvo(naziv, element.index, { "sedmica": sedmica, "predavanja": pp, "vjezbe": pv }, function (status, data) {

						if (status) {
							osvjeziTablicu(trenutnaSedmica, data);
						}


					});
				});
			}
			let a = document.getElementById("r" + (data.studenti.indexOf(element) + 1) + "c" + sedmica);
			let newCell = document.createElement("td");
			row2 = table2.insertRow();
			newCell.appendChild(table2);
			newCell.extra
			a.parentNode.replaceChild(newCell, a);
			table2.style.height = "fitContent";
			table2.className = "table2";
			table2.id = "r" + (data.studenti.indexOf(element) + 1) + "c" + sedmica;

		}

	}

	var validno = true;
	if (data != null) {
		var sedmica = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV"];
		var indexi = [];
		for (let i = 0; i < data.property["0"].studenti.length; i++) {
			indexi.push(data.property["0"].studenti[i].index);
        }

		var br = indexi.length;
		var br2 = new Set(indexi).size;
		if (br != br2) {
			validno = false;
		}
		let trenutnaSedmica = 0;
		let sedmice = [];
		for (let i = 0; i < data.property["0"].prisustva.length; i++) {
			studenti = data.property["0"].prisustva[i];
			if (studenti.sedmica > trenutnaSedmica)
				trenutnaSedmica = studenti.sedmica;
			if (studenti.predavanja > data.property["0"].brojPredavanjaSedmicno || studenti.vjezbe > data.property["0"].brojVjezbiSedmicno || studenti.predavanja < 0 || studenti.vjezbe < 0) {
				validno = false;

				
            }
				
			if (!indexi.includes(studenti.index)) { 
				validno = false;
			}
			if (studenti.sedmica > 15 || studenti.sedmica < 1) { 
				validno = false;
			}
			if (!sedmice.includes(studenti.sedmica))
				sedmice.push(studenti.sedmica);

		}
		let zadnjaSedmica = trenutnaSedmica;
		sedmice.sort();
		if (sedmice.length > 1) {
			for (let i = 1; i < sedmice.length; i++) {
				if (sedmice[i] - sedmice[i - 1] != 1) { 
					validno = false;
				}
					
			}
		}
		for (let z of indexi) {
			var niz = [];
			for (let y of data.property["0"].prisustva) {
				if (z == y.index) {
					if (niz.includes(y.sedmica)) {
						validno = false;
					}
					niz.push(y.sedmica);

				}
			}
		}

		let headerData = ["Ime i prezime", "Index"];

		for (let i = 0; i < trenutnaSedmica; i++) {
			headerData.push(sedmica[i]);
		}
		if (trenutnaSedmica != 15)
			headerData.push(sedmica[trenutnaSedmica] + "-XV")

		if (!validno) {
			var upozorenje = document.createElement("p");
			upozorenje.appendChild(document.createTextNode("Podaci o prisustvu nisu validni!"));
			divRef.appendChild(upozorenje);
		}
		else {

			//pravljenje zaglavlja
			var tabela1 = document.createElement("table");
			divRef.appendChild(tabela1);
			tabela1.className = "tabela1";
			let row = tabela1.insertRow();
			row.id = "zaglavlje";
			for (let key of headerData) {
				let th = document.createElement("th");
				let text = document.createTextNode(key);
				th.appendChild(text);
				if (headerData.indexOf(key) != 0)
					th.class = "zag";
				row.appendChild(th);
			}
			for (let element of data.property["0"].studenti) {

				let row = tabela1.insertRow();
				for (var key in element) {
					if (key != "id") {
						let cell = row.insertCell();
						let text = document.createTextNode(element[key]);
						cell.appendChild(text);
					}
				}
				for (let i = 1; i <= trenutnaSedmica + 1; i++) {
					let cell2 = row.insertCell();
					for (let prisustvo of data.property["0"].prisustva) {

						if (element.index == prisustvo.index && prisustvo.sedmica == i) {
							let text2 = document.createTextNode(Math.round((prisustvo.predavanja + prisustvo.vjezbe) * 10000 / (data.property["0"].brojPredavanjaSedmicno + data.property["0"].brojVjezbiSedmicno)) / 100 + "%");
							cell2.appendChild(text2);
						}
					}

					cell2.id = "r" + (data.property["0"].studenti.indexOf(element) + 1) + "c" + i;

				}



			}
			staviTablicu(trenutnaSedmica, data.property);
			while (divRef.classList.length > 0) {
				divRef.classList.remove(ispod.classList.item(0));
			}
			trenutna = "ts" + trenutnaSedmica;
			zadnja = "zs" + zadnjaSedmica;
			divRef.classList.add(trenutna);
			divRef.classList.add(zadnja);
			//buttoni
			let div2 = document.createElement("div");
			div2.className = "buttons";
			var span = document.createElement('span');
			span.innerHTML = '<button onclick="prisustvo.prethodnaSedmica()" ><i class="fa-solid fa-arrow-left"></i></button>';
			var span2 = document.createElement('span');
			span2.innerHTML = '<button onclick="prisustvo.sljedecaSedmica()" ><i class="fa-solid fa-arrow-right"></i></button>';
			div2.appendChild(span);
			div2.appendChild(span2);
			divRef.appendChild(div2);


		}
}
	function dajPrisustva(predmet) {
    const buffer = fs.readFileSync('public/data/prisustva.json');
    return (JSON.parse(buffer).find(item => item["predmet"] == predmet));
}

	

	let sljedecaSedmica = function () {
		if (trenutnaSedmica != zadnjaSedmica) {
			trenutnaSedmica += 1;
			staviTablicu(trenutnaSedmica, data.property);
			staviPostotak(trenutnaSedmica - 1, data.property);
			ispod = document.getElementById("ispod");
			while (ispod.classList.length > 0) {
				ispod.classList.remove(ispod.classList.item(0));
			}
			trenutna = "ts" + trenutnaSedmica;
			zadnja = "zs" + zadnjaSedmica;
			ispod.classList.add(trenutna);
			ispod.classList.add(zadnja);
		}
	};

	let prethodnaSedmica = function () {
		if (trenutnaSedmica != 1) {
			trenutnaSedmica -= 1;
			staviTablicu(trenutnaSedmica, data.property);
			staviPostotak(trenutnaSedmica + 1, data.property);
			ispod = document.getElementById("ispod");
			while (ispod.classList.length > 0) {
				ispod.classList.remove(ispod.classList.item(0));
			}
			trenutna = "ts" + trenutnaSedmica;
			zadnja = "zs" + zadnjaSedmica;
			ispod.classList.add(trenutna);
			ispod.classList.add(zadnja);
		}

	};


	let osvjeziTablicu = function (sedmica, data2) {
		staviPostotak(sedmica, data2);
		staviTablicu(sedmica, data2);
		console.log("osvjezena");
	
	}
	return {
		modifyData: modifyData,
		sljedecaSedmica: sljedecaSedmica,
		prethodnaSedmica: prethodnaSedmica
	};
};

