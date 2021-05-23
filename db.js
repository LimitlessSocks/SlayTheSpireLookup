const filterDatabase = (db, { name }) => {
    let res = [];
    for(let [ id, card ] of Object.entries(db)) {
        if(card.name.indexOf(name) !== -1) {
            res.push(card);
        }
    }
    return res;
};

const clearElement = (el) => {
    while(el.firstChild) {
        el.removeChild(el.firstChild);
    }
}

const makeElement = (tag, opts = {}, children = []) => {
    let el = document.createElement(tag);
    if(opts.classes) {
        el.classList.add(...opts.classes);
    }
    if(opts.id) {
        el.id = id;
    }
    for(let child of children) {
        el.appendChild(child);
    }
    return el;
};

// const BASE_CARD_RESULT = document.createElement("div");
const BASE_CARD_RESULT = makeElement("div", {}, [
    makeElement("div", { classes: [ "name" ] }),
    makeElement("div", { classes: [ "energy" ] }),
    makeElement("div", { classes: [ "description" ] }),
    makeElement("img", { classes: [ "thumb" ] }),
]);

const formatResult = (entity) => {
    let c = BASE_CARD_RESULT.cloneNode(true);
    c.querySelector(".name").textContent = entity.name;
    c.querySelector(".energy").textContent = entity.energy;
    c.querySelector(".description").textContent = entity.description;
    let imthumb = c.querySelector("img.thumb");
    imthumb.src = "./res/full/" + entity.src;
    imthumb.width = 100;
    return c;
};

window.addEventListener("load", async function () {
    const baseInquiry = await fetch("./base.json");
    const baseDb = await baseInquiry.json();
    // console.log(baseDb[0]);
    window.baseDb = baseDb;
    
    const name = document.getElementById("name");
    const submit = document.getElementById("submit");
    const output = document.getElementById("output");
    
    submit.addEventListener("click", function () {
        let results = filterDatabase(baseDb, { name: name.value });
        // result = result.map(formatResult);
        clearElement(output);
        for(let h of results.map(formatResult)) {
            output.appendChild(h);
        }
    });
});