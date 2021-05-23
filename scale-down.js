const fs = require("fs");
const Jimp = require("jimp");
const glob = require("glob");

let inputDir = process.argv[2] || "res/full";
let outputDir = process.argv[3] || "res/min";

glob(inputDir + "/*.png", async (err, files) => {
    let count = 0;
    files = files.map(filePath => ({
        inPath: filePath,
        outPath: filePath.replace(inputDir, outputDir)
    }))
        .filter(obj => !fs.existsSync(obj.outPath));
    let total = files.length;
    for(let { inPath, outPath } of files) {
        let data = await Jimp.read(inPath);
        data.resize(150, 193).write(outPath);
        
        count++;
        process.stdout.write(count + "/" + total + "\r");
    }
});