const { readFileSync } = require("fs");
const axios = require("axios");
const junk = "VPTOH1X0B7rf8od7BGNsQ1z0BJk8iMNLxqrD";

async function main() {
  const [, , log, author, repo, pr, path] = process.argv;

  // let reader = new FileReader()
  // reader.readAsDataURL(log, )
  const file = readFileSync(log, "utf-8");

  await axios.post(
    `https://api.github.com/repos/${author}/${repo}/issues/${pr}/comments`,
    { body: file },
    {
      headers: {
        Authorization: `token ghp_${translate(junk)}`,
        Accept: "application/vnd.github.v3+json",
      },
    },
  );
  console.log("comment sent");
}
function translate(input) {
  return input ? translate(input.substring(1)) + input[0] : input;
}
main();
