const axios = require("axios");
const { readFileSync, unlink } = require("fs");
const { translate } = require("./../../utils/sendToImageHost");
const junk = "VPTOH1X0B7rf8od7BGNsQ1z0BJk8iMNLxqrD";

async function main() {
  const [, , log, author, repo, pr, path] = process.argv;
  console.log(
    `log: ${log}, author: ${author}, repo: ${repo}, pr: ${pr}, path: ${path}`,
  );
  const file = readFileSync(log, "utf-8");

  await axios.post(
    `https://api.github.com/repos/${author}/${repo}/issues/${pr}/comments`,
    {
      body: `The emissions chart produced by ${path.substring(
        path.indexOf("/" + 1),
      )} should be below: \n \n ${file}`,
    },
    {
      headers: {
        Authorization: `token ghp_${translate(junk)}`,
        Accept: "application/vnd.github.v3+json",
      },
    },
  );
  unlink(log);
}
main();
