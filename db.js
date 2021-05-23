const filterDatabase = (db, { name, energy, type, description }) => {
    let res = [];
    name = name.toLowerCase();
    desc = description.toLowerCase();
    type = type.toLowerCase();
    for(let [ id, card ] of Object.entries(db)) {
        let hasName = !name || card.name.toLowerCase().indexOf(name) !== -1;
        let hasCost = !energy || card.energy === energy;
        let hasType = !type || card.type.toLowerCase() === type;
        let hasDesc = !desc || card.description.toLowerCase().indexOf(desc) !== -1;
        if(hasName && hasCost && hasType && hasDesc) {
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
const BASE_CARD_RESULT = makeElement("div", { classes: [ "result" ] }, [
    makeElement("img", { classes: [ "thumb" ] }),
    makeElement("h3", { classes: [ "name" ] }),
    makeElement("div", { classes: [ "energy" ] }),
    makeElement("div", { classes: [ "description" ] }),
]);

const formatResult = (entity) => {
    let c = BASE_CARD_RESULT.cloneNode(true);
    c.querySelector(".name").textContent = entity.name;
    c.querySelector(".energy").textContent = entity.energy;
    c.querySelector(".description").textContent = entity.description;
    let imthumb = c.querySelector("img.thumb");
    imthumb.src = "./res/full/" + entity.src;
    imthumb.width = 150;
    return c;
};

window.addEventListener("load", async function () {
    const baseInquiry = await fetch("./base.json");
    const baseDb = await baseInquiry.json();
    // console.log(baseDb[0]);
    window.baseDb = baseDb;
    
    const name = document.getElementById("name");
    const type = document.getElementById("type");
    const cost = document.getElementById("cost");
    const desc = document.getElementById("desc");
    const submit = document.getElementById("submit");
    const output = document.getElementById("output");
    
    const onChange = function () {
        let results = filterDatabase(baseDb, { 
            name: name.value,
            energy: cost.value,
            description: desc.value,
            type: type.value,
        });
        clearElement(output);
        for(let h of results.map(formatResult)) {
            output.appendChild(h);
        }
    };
    
    submit.addEventListener("click", onChange);
    
    let inputEls = [ name, type, cost, desc ];
    for(let el of inputEls) {
        el.addEventListener("change", onChange);
        if(el.tagName === "INPUT") {
            el.addEventListener("keypress", function (el) {
                if(el.key == "Enter") onChange();
            });
        }
    }
    
    onChange();
});