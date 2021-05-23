const fs = require("fs");
const Jimp = require("jimp");
const glob = require("glob");

let inputDir = process.argv[2] || "large";
let outputDir = process.argv[3] || "small";

glob(inputDir + "/*.jpg", async (err, files) => {
    let count = 0;
    files = files.map(filePath => ({
        inPath: filePath,
        outPath: filePath.replace(inputDir, outputDir)
    }))
        .filter(obj => !fs.existsSync(obj.outPath));
    let total = files.length;
    for(let { inPath, outPath } of files) {
        let data = await Jimp.read(inPath);
        data.resize(177, 254).write(outPath);
        
        count++;
        process.stdout.write(count + "/" + total + "\r");
    }
});