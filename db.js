const RARITIES = [
    "Starter", "Common", "Uncommon", "Rare"
];
const TYPES = [
    "Attack", "Skill", "Power", "Curse", "Status"
];

// expects target to be lowercase already
const lowerCaseHas = (src, target) =>
    src !== null && src.toLowerCase().indexOf(target) !== -1;

const filterDatabase = (db, { name, energy, type, color, rarity, description }) => {
    let res = [];
    name = name.toLowerCase();
    desc = description.toLowerCase();
    // rarity = rarity.toLowerCase();
    // color = color.toLowerCase();
    type = type.toLowerCase();
    energy = energy.toLowerCase();
    for(let [ id, card ] of Object.entries(db)) {
        let hasName = !name || lowerCaseHas(card.name, name);
        let hasCost = !energy || lowerCaseHas(card.energy, energy);
        let hasRarity = !rarity || card.rarity === rarity;
        let hasColor = color === "" || card.color == color;
        let hasType = !type || lowerCaseHas(card.type, type);
        let hasDesc = !desc || card.description.toLowerCase().indexOf(desc) !== -1;
        if(hasName && hasCost && hasRarity && hasColor && hasType && hasDesc) {
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
        if(typeof child === "string") {
            child = document.createTextNode(child);
        }
        el.appendChild(child);
    }
    return el;
};

// const BASE_CARD_RESULT = document.createElement("div");
const BASE_CARD_RESULT = makeElement("div", { classes: [ "result" ] }, [
    makeElement("img", { classes: [ "thumb" ] }),
    makeElement("div", {}, [
        makeElement("h3", { classes: [ "name" ] }),
        makeElement("span", { classes: [ "energy" ] }),
        makeElement("img", { classes: [ "energy-icon" ] }),
    ]),
    makeElement("div", { classes: [ "byline" ] }, [
        makeElement("span", { classes: [ "rarity" ] }),
        " ",
        makeElement("span", { classes: [ "type" ] }),
    ]),
    makeElement("div", { classes: [ "description" ] }),
]);

const ENERGY_PATHS = {
    3: "RedEnergy.png",
    4: "GreenEnergy.png",
    5: "BlueEnergy.png",
    6: "SmallPurpleEnergy.png",
    0: "ColorlessEnergy.png",
};
const getEnergyColor = (color) => ENERGY_PATHS[color] || ENERGY_PATHS[0];

const KEYWORDS = [
    "Vulnerable",
    "Block",
    "Weak",
    "Strength",
    "Ethereal",
    "Exhausted", "Exhaust",
    "upgraded",
    "Fatal",
    "Poisoned", "Poison",
    "Innate",
    "Evoked", "Evoke",
    "Channeled", "Channel",
    "Lightning", "Frost", "Dark", "Plasma",
    "Artifact",
    "Focus",
    "Wrath", "Calm",
    "Scry",
    "Stances", "Stance",
    "Retain",
    "Mark",
    // ""
    
    "Smite",
    "Wound",
    "Dazed",
    "Insight",
];
let KEYWORD_REGEX = new RegExp(
    [
        KEYWORDS.join("|"),
        RARITIES.join("|"),
        "Energy|energy",
        "\\((s|ALL|not random|does not Exhaust|Upgraded|X?\\+?\\d+)\\)"
    ].join("|"),
    "g"
);

const highlightKeywords = (text) => {
    let res = [];
    
    let matches = text.matchAll(KEYWORD_REGEX);
    
    let lastIndex = 0;
    for(let match of matches) {
        res.push(document.createTextNode(text.slice(lastIndex, match.index)));
        let list = [ "keyword" ];
        let matchText = match[0];
        if(matchText[0] === "(") {
            list.push("upgrade");
        }
        else if(RARITIES.indexOf(matchText) !== -1) {
            list.push(matchText.toLowerCase());
        }
        res.push(makeElement("span", { classes: list }, matchText));
        lastIndex = match.index + matchText.length;
    }
    res.push(document.createTextNode(text.slice(lastIndex)));
    
    // return [text];
    return res;
};

const appendAll = (src, els) => {
    for(let el of els) {
        src.appendChild(el);
    }
};

const formatResult = (entity) => {
    let c = BASE_CARD_RESULT.cloneNode(true);
    let name = c.querySelector(".name");
    let energy = c.querySelector(".energy");
    let description = c.querySelector(".description");
    let rarity = c.querySelector(".rarity");
    let type = c.querySelector(".type");
    name.textContent = entity.name;
    appendAll(description, highlightKeywords(entity.description));
    if(entity.rarity !== null) {
        appendAll(rarity, highlightKeywords(entity.rarity));
    }
    type.textContent = entity.type;
    
    let imthumb = c.querySelector("img.thumb");
    imthumb.src = "./res/min/" + entity.src;
    imthumb.width = 150;
    imthumb.title = "Internal id: " + entity.id;
    
    let enicon = c.querySelector("img.energy-icon");
    if(entity.energy !== null) {
        appendAll(energy, highlightKeywords(entity.energy));
        let path = getEnergyColor(entity.color);
        enicon.src = "./res/sym/" + path;
        enicon.width = 20;
    }
    return c;
};

const getRarityIndex = (card) => RARITIES.indexOf(card.rarity);
const getTypeIndex = (card) => TYPES.indexOf(card.type);

const compareTwoCards = (a, b) => {
    //sort by color
    if(a.color != b.color) {
        if(a.color >= 3 && b.color >= 3 || a.color <= 2 && b.color <= 2) return a.color - b.color;
        if(a.color >= 3 && b.color <= 2) return -1;
        if(a.color <= 2 && b.color >= 3) return 1;
    }
    //then rarity
    let rarityDiff = getRarityIndex(a) - getRarityIndex(b);
    if(rarityDiff !== 0) return rarityDiff;
    //then type
    let typeDiff = getTypeIndex(a) - getTypeIndex(b);
    // console.log(typeDiff, getTypeIndex(a), getTypeIndex(b));
    if(typeDiff !== 0) return typeDiff;
    
    return a.name.localeCompare(b.name);
};

const sortResults = (results) => results.sort(compareTwoCards);

const Search = {
    Cache: [],
    StartIndex: -1,
};

window.addEventListener("load", async function () {
    const baseInquiry = await fetch("./base.json");
    const baseDb = await baseInquiry.json();
    // console.log(baseDb[0]);
    window.baseDb = baseDb;
    
    const name = document.getElementById("name");
    const type = document.getElementById("type");
    const cost = document.getElementById("cost");
    const rarity = document.getElementById("rarity");
    const color = document.getElementById("color");
    const desc = document.getElementById("desc");
    const autoShowAll = document.getElementById("autoShowAll");
    const submit = document.getElementById("submit");
    const output = document.getElementById("output");
    const showMoreButton = makeElement("button", { classes: [ "showMore" ] }, "Show More");
    const showAllButton = makeElement("button", { classes: [ "showAll" ] }, "Show All");
    const showDialogue = makeElement("div", { classes: [ "showDialogue" ] }, [
        showMoreButton,
        showAllButton,
    ]);
    
    let perPage = 20;
    const showMore = () => {
        showDialogue.remove();
        let next = Search.StartIndex + perPage;
        let sub = Search.Cache.slice(Search.StartIndex, next);
        Search.StartIndex = next;
        for(let h of sub.map(formatResult)) {
            output.appendChild(h);
        }
        if(Search.Cache.length > Search.StartIndex) {
            showAllButton.textContent = "Show Rest (" + (Search.Cache.length - Search.StartIndex) + " more)";
            output.appendChild(showDialogue);
        }
    };
    const showAll = () => {
        showMore();
        if(Search.StartIndex < Search.Cache.length) {
            requestAnimationFrame(showAll);
        }
    };
    
    showMoreButton.addEventListener("click", showMore);
    showAllButton.addEventListener("click", showAll);
    // autoShowAll.addEventListener("change", function () {
        // if(this.checked) showAll();
    // });
    
    const onChange = function () {
        let results = filterDatabase(baseDb, { 
            name: name.value,
            energy: cost.value,
            rarity: rarity.value,
            description: desc.value,
            type: type.value,
            color: color.value,
        });
        results = sortResults(results);
        Search.Cache = results;
        Search.StartIndex = 0;
        clearElement(output);
        if(autoShowAll.checked) {
            showAll();
        }
        else {
            showMore();
        }
    };
    
    submit.addEventListener("click", onChange);
    
    let inputEls = [ name, type, rarity, color, autoShowAll, cost, desc ];
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