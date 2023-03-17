const MODIFIED = parse(process.env.MODIFIED);
const ADDED = parse(process.env.ADDED);
console.log(MODIFIED);
console.log(ADDED);
const fileSet = new Set();

[...MODIFIED, ...ADDED].forEach(file => {
  console.log("entered");
  const [root, dir] = file.split("/");
  console.log(root);
  if (root === "projects") fileSet.add(root + "/" + dir);
});

console.log(JSON.stringify([...fileSet]));

function parse(data) {
  return data.replace("[", "").replace("]", "").split(",");
}
