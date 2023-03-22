const MODIFIED1 = parse1(process.env.MODIFIED);
const ADDED1 = parse1(process.env.ADDED);
console.log('Modified', MODIFIED1);
console.log('Added', ADDED1);
const files1 = [...MODIFIED1, ...ADDED1]
const fileSet1 = new Set();
console.log('file list', files1)

files1.forEach(file => {
  const [root, dir] = file.split("/");
  if (root === "protocols") fileSet1.add(root + "/" + dir);
});

console.log('file set: ', fileSet1);

function parse1(data: any) {
  return data.replace("[", "").replace("]", "").split(",");
}
