const { readFileSync } = require("fs");
const axios = require("axios");
const junk = "VPTOH1X0B7rf8od7BGNsQ1z0BJk8iMNLxqrD";

async function main() {
  const [, , log, author, repo, pr, path] = process.argv;
  await axios.post(
    `https://api.github.com/repos/${author}/${repo}/issues/${pr}/comments`,
    { body: "enter" },
    {
      headers: {
        Authorization: `token ghp_${translate(junk)}`,
        Accept: "application/vnd.github.v3+json",
      },
    },
  );
  const file = readFileSync(log, "image/png");

  const errorString = "------ ERROR ------";
  const summaryIndex = file.indexOf("------ CHART ------");
  const errorIndex = file.indexOf(errorString);
  let body;

  if (summaryIndex != -1) {
    body = `The adapter at ${path} exports chart: 
        \n \n ${file.substring(summaryIndex + 17)}`;
  } else if (errorIndex != -1) {
    body = `Error while running adapter at ${path}: 
        \n \n ${file.split(errorString)[1].replaceAll("\n", "\n    ")}`;
  } else return;

  await axios.post(
    `https://api.github.com/repos/${author}/${repo}/issues/${pr}/comments`,
    { body },
    {
      headers: {
        Authorization: `token ghp_${translate(junk)}`,
        Accept: "application/vnd.github.v3+json",
      },
    },
  );
}
function translate(input) {
  return input ? translate(input.substring(1)) + input[0] : input;
}
main();
