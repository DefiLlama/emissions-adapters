const axios = require("axios");
const FormData = require("form-data");
const junk = "5a584109a2a0d89aa748a89120e702d6";

export function translate(input: string): string {
  return input ? translate(input.substring(1)) + input[0] : input;
}

export async function sendToImageHost(source: string): Promise<string> {
  let data = new FormData();
  data.append("key", translate(junk));
  data.append("source", source.substring(22));
  data.append("format", "json");

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://freeimage.host/api/1/upload",
    headers: {
      Cookie: "PHPSESSID=sa4773qa9aukfhpeks8dirtodd",
      ...data.getHeaders(),
    },
    data: data,
  };

  const res = await axios(config);

  if (res.status != 200) return `unable to save image!!`;
  return res.data.image.display_url;
}
