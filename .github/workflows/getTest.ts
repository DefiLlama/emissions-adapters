const MODIFIED1 = parse1(process.env.MODIFIED);
const ADDED1 = parse1(process.env.ADDED);
console.log('MODIFIED', MODIFIED1);
console.log('MODIFIED', ADDED1);
const files1 = [...MODIFIED1, ...ADDED1]
const fileSet1 = new Set();
console.log('file list', files1)

files1.forEach(file => {
  console.log("entered ", file);
  const [root, dir] = file.split("/");
  console.log(root);
  if (root === "projects") fileSet1.add(root + "/" + dir);
});

console.log('file set: ', fileSet1);

function parse1(data: any) {
  return data.replace("[", "").replace("]", "").split(",");
}
