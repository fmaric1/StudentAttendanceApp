let TabelaPrisustvo = function (divRef, data) {

	document.getElementById("naziv_predmeta").innerHTML = data.predmet;
	divRef.innerHTML = "";
	var validno = true;



	var sedmica = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV"];
	var indexi = [];
	for (let studenti of data.studenti) {
		indexi.push(studenti.index);
	}

	var br = indexi.length;
	var br2 = new Set(indexi).size;
	if (br != br2) {
		validno = false;
    }
	let trenutnaSedmica = 0;
	
	for (let studenti of data.prisustva) {
		if (studenti.sedmica > trenutnaSedmica)
			trenutnaSedmica = studenti.sedmica;
		if (studenti.predavanja > data.brojPredavanjaSedmicno || studenti.vjezbe > data.brojVjezbiSedmicno || studenti.predavanja < 0 || studenti.vjezbe < 0)
			validno = false;
		if (!indexi.includes(studenti.index))
			validno = false;
		if (studenti.sedmica > 15 || studenti.sedmica < 1)
			validno = false;


	}

	for (let z of indexi) {
		var niz = [];
		for (let y of data.prisustva) {
			if (z == y.index) {
				if (niz.includes(y.sedmica))
					validno = false;
					niz.push(y.sedmica);
               
            }
        }
	}

	let headerData = ["Ime i prezime", "Index"];

	for (let i = 0; i < 15; i++) {
 		headerData.push(sedmica[i]);
	}

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

		for (let element of data.studenti) {
			let row = tabela1.insertRow();
			for (var key in element) {
				let cell = row.insertCell();
				let text = document.createTextNode(element[key]);
				cell.appendChild(text);
			}
			for (let i = 1; i <= 15; i++) {
				let cell2 = row.insertCell();
				for (let prisustvo of data.prisustva) {

					if (element.index == prisustvo.index && prisustvo.sedmica == i) {
						let text2 = document.createTextNode(Math.round((prisustvo.predavanja + prisustvo.vjezbe) * 10000 / (data.brojPredavanjaSedmicno + data.brojVjezbiSedmicno))/100 + "%");
						cell2.appendChild(text2);
					}
				}

				cell2.id = "r" + (data.studenti.indexOf(element) + 1) + "c" + i;

			}



		}
		staviTablicu(trenutnaSedmica, data);
	
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

	let sljedecaSedmica = function () {
		if (trenutnaSedmica != 15) {
			trenutnaSedmica += 1;
			staviTablicu(trenutnaSedmica, data);
			staviPostotak(trenutnaSedmica - 1, data);
		}
	};

	let prethodnaSedmica = function () {
		if (trenutnaSedmica != 1) {
			trenutnaSedmica -= 1;
			staviTablicu(trenutnaSedmica, data);
			staviPostotak(trenutnaSedmica + 1, data);
		}

	};


	return {
		sljedecaSedmica: sljedecaSedmica,
		prethodnaSedmica: prethodnaSedmica
	};
};

function staviPostotak(sedmica, data) {
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
			text3 = document.createTextNode(Math.round(x * 10000 / (data.brojPredavanjaSedmicno + data.brojVjezbiSedmicno))/100 + "%");
		newCell.appendChild(text3);
		a.parentNode.replaceChild(newCell, a);
		newCell.id = "r" + (data.studenti.indexOf(element) + 1) + "c" + sedmica;



	}
}

function staviTablicu(sedmica, data) {
	for (let element of data.studenti) {
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
		let pp = -1,
			pv = -1;
		for (let x of data.prisustva) {
			if (x.index == element.index && x.sedmica == sedmica) {
				pp = x.predavanja;
				pv = x.vjezbe;
			}
		}

		for (let i = 0; i < data.brojPredavanjaSedmicno; i++) {
			let cell3 = row3.insertCell();
			if (pp == -1) {

				cell3.classname = "bijela";

			} else {
				if (i < pp)
					cell3.className = "zelena";
				else
					cell3.className = "crvena";
			}
		}
		for (let i = 0; i < data.brojVjezbiSedmicno; i++) {
			let cell3 = row3.insertCell();
			if (pv == -1) {

				cell3.classname = "bijela";

			} else {
				if (i < pv)
					cell3.className = "zelena";
				else
					cell3.className = "crvena";
			}
		}
		let a = document.getElementById("r" + (data.studenti.indexOf(element) + 1) + "c" + sedmica);
		let newCell = document.createElement("td");
		row2 = table2.insertRow();
		newCell.appendChild(table2);
		a.parentNode.replaceChild(newCell, a);
		table2.style.height = "fitContent";
		table2.className = "table2";
		table2.id = "r" + (data.studenti.indexOf(element) + 1) + "c" + sedmica;
	}
}