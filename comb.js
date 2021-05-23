db = (function () {
let i = 0, id = 0;
let db = {};
for(let table of document.querySelectorAll("table")) {
  for(let row of table.querySelectorAll("tbody tr")) {
    db[id] = {
      id: id,
      name: row.children[0].textContent.trim(),
      rarity: row.children[2].textContent.trim(),
      energy: null,
      type: null,
      description: row.children[3].textContent.trim(),
      img: row.children[1].querySelector("a").href,
      color: i,
      mod: "base",
    };
    if(row.children[4]) {
      db[id].type = row.children[3].textContent.trim();
      db[id].energy = row.children[4].textContent.trim();
      db[id].description = row.children[5].textContent.trim();
    }
    else {
      db[id].type = ["Status", "Curse"][i];
      if(db[id].type === "Curse") {
        db[id].description = db[id].rarity;
        db[id].rarity = null;
      }
    }
    id++;
  }
  i++;
  // id = Math.max(id, 1000*i);
  //id for internal use only
}
return db;
})();
copy(JSON.stringify(db));