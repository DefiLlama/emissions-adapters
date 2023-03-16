console.log(`modified: ${process.env.MODIFIED}`);
console.log(`added: ${process.env.ADDED}`);
const MODIFIED = parse(process.env.MODIFIED);
const ADDED = parse(process.env.ADDED);
const fileSet = new Set();

[...MODIFIED, ...ADDED].forEach(file => {
  const [root, dir] = file.split("/");
  if (root === "protocols") fileSet.add(root + "/" + dir);
});

console.log(JSON.stringify([...fileSet]));

function parse(data) {
  console.log("data below:");
  console.log(data);
  console.log("data above:");
  return data; //.replace("[", "").replace("]", "").split(",");
}
